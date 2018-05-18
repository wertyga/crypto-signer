import { combineReducers } from 'redux';

import user from './user';
import pairs from './pairs';
import tradePairs from './tradePairs';
import whaleOrders from './whaleOrders';

export default combineReducers({
    user,
    pairs,
    tradePairs,
    whaleOrders
});