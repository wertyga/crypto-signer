import hash from 'password-hash';

import config from '../common/config';
import validateInputs from '../middlewares/validateRequireFields';
import validateUserSession from '../middlewares/session';

import { getTradePairs } from './common/functions';
import { createSocketConnection } from '../index';

import User, { userFields } from '../models/user';
import Pair, { pairFields } from '../models/pair';
import ActualPairs from '../models/tradePairs';

import renderHtml from '../common/renderHtml';

const route = require('express').Router();

// Registration new user
route.post('/sign-up', validateInputs, (req, res) => {
    User.findOne({ username: req.body.username })
        .then(user => {
            if(user) {
                res.status(409).json({ errors: { username: 'User is already exist' }})
            } else {
                return Promise.all([
                    signUpNewUser(req),
                    getTradePairs()
                ])
                    .then(resp => {
                        const [user, pairs] = resp;
                        req.session[config.session.fieldToSaveSession] = user.user._id;
                        req.session.save();

                        res.json({
                            ...user,
                            pairs
                        })
                    })
            }
        })
        .catch(err => res.status(500).json({ errors: { globalError: err.message }}))
});


//Login user
route.post('/login', validateInputs, (req, res) => {
    Promise.all([
        loginUser(req.body.username),
        getTradePairs()
    ])
        .then(data => {
            const [user, pairs] = data;
            if(user && hash.verify(req.body.password, user.hashPassword)) {
                req.session[config.session.fieldToSaveSession] = user._id;
                req.session.save();
                res.json({
                    user: userFields(user),
                    tradePairs: user.tradePairs,
                    pairs
                })
            } else if(!user) {
                res.status(404).json({ errors: { username: 'User is not exist'}});
            } else {
                res.status(404).json({ errors: { password: 'Password is not correct'}});
            }
        })
        .catch(err => res.status(500).json({ errors: { globalError: err.message }}))

});

route.get('/logout', (req, res) => { // Logout user
    req.session.destroy();
    res.json('logout')
});

export default route;

export function loginUser(username) { // Login user
    return User.findOne({ username })
        .then(user => {
            if(!user) { throw new Error('User is not exist')}
            return Pair.populateByTitle(user.tradePairs).then(pairs => { return { ...user._doc, tradePairs: [...pairs] }})

        })
};

function signUpNewUser(req) { // Sign up new user
    return new User({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email
    }).save()
        .then(user => {
            return {
                user: userFields(user),
                tradePairs: user.tradePairs
            }})
};
