import mongoose from 'mongoose';

import Pair from './pair';

import fetchFields from '../common/compileNeedFields';

const CollectPairsSchema = new mongoose.Schema({
    symbol: {
        type: String,
        unique: true
    },
    price: Number,
    prevPrice: Number
});

export const tradePairFields = (instance) => {
    const tradePairNeedFields = ['symbol', 'price', 'prevPrice'];
    return fetchFields(tradePairNeedFields, instance);
};

export default mongoose.model('actualPair', CollectPairsSchema);