import mongoose from 'mongoose';

import { remindUser } from '../routes/common/functions';
import getNeedFields from '../common/compileNeedFields';

import User from './user';

const ReachedPercent = new mongoose.Schema({
    symbol: {
        type: String
    },
    interval: {
        type: String
    },
    high: Number,
    close: Number,
    percent: {
        type: Number
    }
}, { timestamps: true });

ReachedPercent.post('save', doc => {
    User.find({}).then(users => {
        Promise.all(users.map(user => {
            if(user.percents.indexOf(doc._id) === -1 && user.isCool) {
                if(doc.percent < 0) {
                    remindUser(user.email, doc, false, false);
                } else {
                    remindUser(user.email, doc, false, true);
                };
                user.percents.push(doc._id);
                return user.save();
            };
        }))
    })
});

export const percentFields = (instance) => {
    const percentNeedFields = ['symbol', 'interval', 'high', 'close', 'percent', 'updatedAt', '_id'];
    return getNeedFields(percentNeedFields, instance)
};

export default mongoose.model('percent', ReachedPercent);