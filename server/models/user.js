import mongoose from 'mongoose';
import hash from 'password-hash';

import fetchFields from '../common/compileNeedFields';

import Percent from './reachedPercent';

let UserSchema = new mongoose.Schema({ //User Schema
    username: {
        type: String,
        require: true,
        unique: true
    },
    email: {
        type: String,
        require: true
    },
    hashPassword: {
        type: String,
        require: true
    },
    tradePairs: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'pair'
        }],
        default: []
    },
    isAuth: {
        type: Boolean,
        default: false
    },
    isCool: {
        type: Boolean,
        default: true
    },
    percents: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'percent'
        }],
        default: []
    }
});

const UserModel = mongoose.model('user', UserSchema);

// Instance methods for password
const encryptPassword = function(password){
    return hash.generate(password);
};

UserSchema.virtual('password')
    .set(function(password){
        this.hashPassword = encryptPassword(password);
    })
// *********************************

export const userFields = (instance) => {
    const UserNeedFields = ['username', '_id', 'reachedSymbolsByPercent', 'email'];
    return fetchFields(UserNeedFields, instance)
};

export default UserModel;