import validateCredentials from '../middlewares/session';
import ValidationCorrectPair from '../middlewares/ValidationCorrectPair';

import Pair, { pairFields } from '../models/pair';
import ActualPairs  from '../models/tradePairs';
import User from '../models/user';
import Whales from '../models/whale';

const routes = require('express').Router();

routes.get('/get-whales', validateCredentials, (req, res) => {
    Whales.find({})
        .then(whales => res.json(whales))
        .catch(err => res.status(500).json({ errors: err.message }))
});

routes.post('/delete-percent-pair', (req, res) => {
    const { userId, percentPairsId } = req.body;

    User.findById(userId)
        .then(user => { 
            user.percents.splice(user.percents.indexOf(percentPairsId), 1);
            return user.save()
        })
        .then(() => res.json(`${percentPairsId} - deleted`))
});

routes.post('/set-sign', validateCredentials, ValidationCorrectPair, (req, res) => { // Set sign price
    const { price, pair, userId } = req.body;

    return ActualPairs.findOne({ symbol: pair })
        .then(actualPair => {
            if(!actualPair) throw new Error('There is no symbol');
            return true;
        })
        .then(() => {
            return new Pair({
                title: pair,
                signPrice: price,
                owner: userId
            }).save()
                .then(pair => {
                    return Pair.populateByTitle(pair._id)
                })
                .then(pair => {
                    res.json(pair)
                })
        })
        .catch(err => res.status(400).json({ errors: err.message }))
});

routes.post('/delete-pair', validateCredentials, (req, res) => { // Delete pair
    const { id } = req.body;
    return Pair.findById(id)
        .then(user => user.remove())
        .then(user => res.json('removed'))
        .catch(err => res.status(500).json(err.message))
});

routes.get('/get-symbol-price/:symbol', (req, res) => { // Get price of symbol for Adding sing price element
    ActualPairs.findOne({ symbol: req.params.symbol })
        .then(pair => {
            if(pair) {
                res.json(pair.price)
            } else {
                res.status(404).json('Symbol not found')
            }
        })
});

export default routes;






