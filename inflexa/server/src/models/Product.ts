import { Schema, model } from 'mongoose';

const productSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    ageRange: {
        type: String,
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    focusArea: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    format: {
        type: String,
        enum: ['physical', 'printable'],
        required: true,
    },
    includedItems: {
        type: [String],
        required: true,
    },
    inventoryCount: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

const Product = model('Product', productSchema);

export default Product;