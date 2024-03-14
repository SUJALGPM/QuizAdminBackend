// models/category.js

const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: false, // Set the default value to true for new categories
  },
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
