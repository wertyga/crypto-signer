import axios from 'axios';

import * as consts from './constants';

import { setPairs, setTradePairs } from './api';

export const userAuth = (data) => dispatch => { // User authentication
    return axios.post(data.url, data)
        .then(res => {
            dispatch(setUser(res.data.user));
            dispatch(setPairs(res.data.pairs));
            dispatch(setTradePairs(res.data.tradePairs));
            return res.data.user.username
        })
};
export function getUserData(username) { // Get user data when reload/enter "/api/user/:id"
    return dispatch => {
        return axios.post(`/user/${username}`, {})
            .then(res => {
                dispatch(setUser(res.data.user));
                dispatch(setPairs(res.data.pairs));
                dispatch(setTradePairs(res.data.tradePairs));
                return true;
            })
    };
};
export function setUser(user) { //Set user data to user-reducer
    return {
        type: consts.SET_NEW_USER,
        user
    }
};

export const clearUser = () => dispatch => {
    return axios.get('/auth/logout')
        .then(() => dispatch(clearUserAction()))
};
function clearUserAction() {
    return {
        type: consts.CLEAR_USER
    }
};