const mongoose = require('mongoose');
const { Schema } = mongoose;

const categorySchema = new Schema({
    categoryId: {
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
    },
    products: [
        {
        type: String,
        ref: 'Product'
    }
    ],
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;