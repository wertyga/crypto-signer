import mongoose from 'mongoose';

const whaleSchema = mongoose.Schema({
    symbol: {
        type: String
    },
    orders: {
        type: [{
            price: Number,
            amount: Number,
            totalBtc: Number
        }],
        default: []
    }
}, { timestamps: true });

export default mongoose.model('whale', whaleSchema);