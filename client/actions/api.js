import axios from 'axios';
import * as consts from './constants';

import { setUser } from './auth';

export const getActualPairs = () => dispatch => { // Fetch actual trade pairs
    return axios.get('/api/collect-pairs')
        .then(res =>  dispatch(setPairs(res.data)))
};
export function setPairs(pairs) { // Update actual trade pairs
    return {
        type: consts.SET_PAIRS,
        pairs
    }
};

export const setSignPrice = (data) => dispatch => { // Set pair to watch sign price
    return axios.post('/api/set-sign', data)
        .then(res => {
            dispatch(addTradePairs(res.data));
        })
};
export function setTradePairs(tradePairs) {
    return {
        type: consts.SET_NEW_USER_TRADE_PAIRS,
        tradePairs
    }
};
export function addTradePairs(tradePair) {
    return {
        type: consts.ADD_USER_TRADE_PAIR,
        tradePair
    }
};

export const updatePrice = (pairId) => dispatch => { // Update price of pair
    return axios.post('/api/update-price', { pairId })
        .then(res => dispatch(priceUpdate(res.data)))
};

export const updatePairsPrice = (pairs) => dispatch => {
    return dispatch(priceUpdate(pairs))
};
function priceUpdate(pairs) {
    return {
        type: consts.UPDATE_ALL_USERS_PAIRS_PRICE,
        pairs
    };
};

export const deletePair = id => dispatch => { // Delete Pair from user's pair list
    return axios.post('/api/delete-pair', { id })
        .then(res => dispatch(pairDeleteAction(id)))
};
function pairDeleteAction(id) {
    return {
        type: consts.DELETE_PAIR,
        id
    };
};

export const getWhaleOrders = () => dispatch => { // Get Whales orders
    return axios.get('/api/get-whales')
        .then(res => dispatch(getWhalesAction(res.data)))
};
function getWhalesAction(orders) {
    return {
        type: consts.GET_WHALES_ORDERS,
        orders
    }
};

export const fetchPairPrice = id => dispatch => {
    return axios.get(`/api/get-symbol-price/${id}`)
        .then(res => res.data)
};
