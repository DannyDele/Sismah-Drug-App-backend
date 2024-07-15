const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
    productId: {
        type: String,
        unique: true,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    subcategory: {
        type: String
    },
    manufacturer: {
        type: String
    },
    expiryDate: {
        type: Date
    },
     availability: {
        type: Boolean,
        required: true,
        default: true
    },
     images: {
         type: [String], // Array of strings to store multiple image URLs
        required: true
    },
    store: {
        type: String,
        ref: 'Store',
        required: true
    },
    category: {
        type: String,
        ref: 'Category',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
