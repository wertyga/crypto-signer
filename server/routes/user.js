import renderHtml from '../common/renderHtml';

import { getTradePairs } from './common/functions';

import { userFields } from '../models/user';
import { pairFields } from '../models/pair';
import Whale from '../models/whale';

import UserScreen from '../../client/components/UserScreen/UserScreen';
import SignupPage from '../../client/components/SignupPage/SignupPage';
import Whales from '../../client/components/Whales/Whales';

import validateCredentials from '../middlewares/session';

import { loginUser } from './auth';

const routes = require('express').Router();

routes.get('/:username/whales-orders', validateCredentials, (req, res) => {
    Promise.all([
        loginUser(req.params.username),
        getTradePairs(),
        Whale.find({})
    ])
        .then(data => {
            const [user, pairs, whales] = data;
            const store = {
                whaleOrders: whales,
                user: userFields(user),
                tradePairs: user.tradePairs,
                pairs
            };
            res.send(renderHtml(req, <Whales/>, store))
        })
});

routes.get('/sign-up', (req, res) => {
    res.send(renderHtml(req, <SignupPage/>))
});

routes.get('/:username', validateCredentials, (req, res) => {
    Promise.all([
        loginUser(req.params.username),
        getTradePairs()
    ])
        .then(data => {
            const [user, pairs] = data;
            if(!user) {
                req.session.destroy();
                res.redirect('/');
                return;
            }
            const store = {
                user: userFields(user),
                tradePairs: user.tradePairs,
                pairs
            };

            res.send(renderHtml(req, <UserScreen/>, store))
        })
        .catch(err => res.status(500).json({ errors: { globalError: err.message }}))
});

export default routes;