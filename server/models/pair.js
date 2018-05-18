import mongoose from 'mongoose';

import User from './user';
import ActualPairs from './tradePairs';

import fetchFields from '../common/compileNeedFields';
import { tradePairFields } from './tradePairs';

const pairSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    signPrice: Number,
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: 'user'
    },
    sign: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

pairSchema.post('save', function(doc) {
    return User.findById(doc.owner)
        .then(user => {
            user.tradePairs = [...user.tradePairs, doc];
            return user.save();
        })
});
pairSchema.post('remove', function(doc) {
    return User.findById(doc.owner)
        .then(user => {
            user.tradePairs.splice(user.tradePairs.indexOf(doc._id), 1);
            return user.save();
        })
});

pairSchema.static('populateByTitle', function(ids) {
    let isArray = true;
    if(!(ids instanceof Array)) {
        ids = [ids];
        isArray = false;
    };
    return Promise.all(ids.map(id => {
        return this.findById(id)
            .then(pair => {
                if(!pair) return false;
                return ActualPairs.findOne({ symbol: pair.title})
                    .then(title => {
                        return {
                            ...tradePairFields(title),
                            ...pairFields(pair)
                        };
                    })
            })
    }))
        .then(pairs => {
            if(isArray) {
                return pairs;
            } else {
                return pairs[0];
            }
        })
});

const PairModel = mongoose.model('pair', pairSchema);



export const pairFields = (instance) => {
    const pairNeedFields = ['_id', 'signPrice', 'sign', 'updatedAt'];
    return fetchFields(pairNeedFields, instance);
};

export default PairModel;