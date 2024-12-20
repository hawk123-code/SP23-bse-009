
const mongoose = require("mongoose");

let categorySchema = new mongoose.Schema({
  product: String,
  description: String,
  category: String,
  price: Number,
  quantity: Number,
  picture: String,
});

let Category = mongoose.model("Category", categorySchema);

module.exports = Category;
