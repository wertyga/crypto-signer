import EventEmitter from 'events';

import isEmpty from 'lodash/isEmpty';

import nodemailer from 'nodemailer';

import User, { userFields } from '../../models/user';
import ActualPairs  from '../../models/tradePairs';
import Pair, { pairFields } from '../../models/pair';
import Percent  from '../../models/reachedPercent';
import Whale  from '../../models/whale';

import emailConfig from '../../common/emailConfig';

export const api = new Api();
export const percentSign = new EventEmitter();

import Api from '../../common/binanceAPI';

const lowPercent = 10;
const growPercent = 2;
const interval = '2h';

export function fetchUserData(id, req) { //Fetch user data with populate everything
    return User.findById(id).populate({
        path: 'tradePairs',
        model: Pair,
        populate: {
            path: 'title',
            model: ActualPairs
        }
    })
        .then(user => {
            if(user) {
                return {
                    user: userFields(user),
                    tradePairs: pairFields(user.tradePairs)
                };
            } else {
                req.session.destroy();
                throw Error('User is not exist!')
            }
        })
};

export function getTradePairs() { //Fetch available trade pairs
    return ActualPairs.find({}, 'symbol')
};

export function updateTradePairs() { //Update price of all symbols on market
    return api.getPriceForAllSymbols()
        .then(res => {
            return Promise.all(res.map(resPair => {
                return ActualPairs.findOne({ symbol: resPair.symbol })
                    .then(pair => {
                        if(pair) {
                            pair.prevPrice = pair.price;
                            pair.price = resPair.price;
                            return pair.save();
                        } else {
                            return new ActualPairs({
                                symbol: resPair.symbol,
                                price: resPair.price,
                                prevPrice: resPair.price
                            }).save();
                        }
                    })
                    .then(pair => {
                        const onePercent = pair.prevPrice / 100;
                        const different = (pair.price - pair.prevPrice) / onePercent;
                        if(different > growPercent) {
                            return Percent.findOne({ symbol: pair.symbol})
                                .then(percent => {
                                    if(percent && (percent.percent !== pair.percent)) {
                                        percent.percent = different;
                                        return percent.save();
                                    } else if(!percent){
                                        return new Percent({
                                            symbol: pair.symbol,
                                            percent: Number(different.toFixed(2))
                                        }).save();
                                    } else {
                                        return false;
                                    };
                                })
                        };
                        return;
                    });
            }))
        })
        .catch(err => console.error('Error in "updateTradePairs" function \n' + err))
};

export function checkPairsForSignPrice() { // Check all pairs for compare to sign price
    return Pair.find({})
        .then(pairs => {
            if(pairs.length < 1) return;
            return Promise.all(pairs.map(pair => {
                if(
                    (!pair.sign) &&
                    ((pair.title.price < pair.signPrice && pair.title.prevPrice > pair.signPrice) ||
                    (pair.title.price > pair.signPrice && pair.title.prevPrice < pair.signPrice))
                ) {
                    pair.sign = true;
                    return pair.save()
                        .then(pair => User.findById(pair.owner))
                        .then(user => remindUser(user.email, pair, { sign: true }));
                };
            }))
        })
        .catch(err => console.error('Error in "checkPairsForSignPrice" function \n' + err))
};

export function remindUser(email, pair, sign, up) { // Remind user that sign price is reached
    let html;
    if(sign) {
        html = `<div>
                <h3>${pair.title.symbol}</h3>
                 <p>Has reached ${pair.signPrice}</p>
                  <br>
                  <p>Time: ${new Date()}</p>
                </div>`;
    } else if(!sign && !up){
        html = `<div>
                <h3>${pair.symbol}</h3>
                 <p>Down for ${pair.percent}% from ${pair.high} to ${pair.close}</p>
                  <br>
                  <p>Time: ${new Date()}</p>
                </div>`;
    } else {
        html = `<div>
                <h3>${pair.symbol}</h3>
                 <p>Growing for ${pair.percent}%</p>
                  <br>
                  <p>Time: ${new Date()}</p>
                </div>`;
    }
    const transporter = nodemailer.createTransport(emailConfig);
    const mailOptions = {
        from: 'Crypto_Signer',
        to: email,
        subject: 'Message from "Crypto_Signer"',
        html
    };
    transporter.sendMail(mailOptions, (err, info) => {
        if(err) {
            console.error('Сообщение не отправлено!')
        } else {
            console.log('Сообщение Отправлено!')
        }
    })
};

export function savePercents(interval, percent) {
    return analyzeData(interval, percent)
        .then(symbols => {
            return Promise.all(symbols.map(symbol => {
                return Percent.findOne({ symbol: symbol.symbol})
                    .then(percent => {
                        if(percent && (percent.percent !== symbol.percent)) {
                            percent.percent = symbol.percent;
                            return percent.save();
                        } else if(!percent){
                            return new Percent(symbol).save();
                        } else {
                            return false;
                        };
                    })
            }))
        })
        .catch(err => console.error('Error in "savePercents" function \n' + err))

};

function inspectChanging(interval = interval) { // Get all pairs data and inspect them if need
    const [open, high, low, close] = [1, 2, 3 ,4];
    return ActualPairs.find({}, 'symbol')
        .then(pairs => {
            return Promise.all(pairs.map(pair => {
                return api.getKlineData(pair.symbol, interval)
            }))
        })
        .then(data => {
            return data.map(item => {
                return {
                    symbol: item.pair,
                    open: Number(item.data[open]),
                    high: Number(item.data[high]),
                    low: Number(item.data[low]),
                    close: Number(item.data[close]),
                }
            })
        })
        .catch(err => console.error('Error in "inspectChanging" function \n' + err))
};

function analyzeData(interval, percent = lowPercent) { // Analyze klines data
    return inspectChanging(interval)
        .then(data => {
            return data.map(item => {
                const onePercent = Math.round((item.high / 100).toFixed(8));
                const different = onePercent !== 0 ? Math.round((item.high - item.close) / onePercent) : 0;
                if(different >= percent && item.open > item.close) {
                    return {
                        ...item,
                        interval: interval || '2h',
                        percent: -different
                    };
                } else {
                    return item;
                };
            }).filter(item => !!item.percent)
        })
        .catch(err => console.error('Error in "analyzeData" function \n' + err))
};

function getOrders(purposePriceInBtc = 10) {
    ActualPairs.find({})
        .then(pairs => {
            return Promise.all(pairs.filter(item => item.symbol !== 'BTCUSDT').map(pair => {
                return api.getOrdersBook(pair.symbol)
                    .then(data => data.bids
                        .filter(item => (Number(item[0]) * Number(item[1])) >= purposePriceInBtc)
                        .map(item => {
                            return {
                                symbol: pair.symbol,
                                data: {
                                        price: item[0],
                                        amount: Math.round(item[1]),
                                        totalBtc: Math.round(Number(item[0]) * Number(item[1]))
                                    }
                            }
                        })
                    )}))
        })
        .then(data => data.filter(item => item.length > 0)
            .map(item => {
                return item.reduce((initObj, innerArr) => {
                    initObj.symbol = innerArr.symbol;
                    initObj.orders = initObj.orders ? [...initObj.orders, innerArr.data] : [innerArr.data];

                    return initObj;
            }, {});
        }))
        .then(data => {
            return Whale.deleteMany({}).then(() => data);
        })
        .then(data => {
            return Promise.all(data.map(item => {
                return new Whale(item).save();
            }))
        })
        .catch(err => console.error('Error in "getOrders" function \n' + err))
};

//Intervals
setInterval(() => {
    updateTradePairs()
        .then(() => checkPairsForSignPrice())
}, 10000);

setInterval(() => {
    savePercents(interval, lowPercent);
    getOrders();
}, 60000);
savePercents(interval, lowPercent);
getOrders();


