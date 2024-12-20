const mongoose = require("mongoose");

const CategorySelectionSchema = new mongoose.Schema({
  category: String,
});
//make a model
let CategorySelectionschema = mongoose.model("CategorySelection",CategorySelectionSchema );
//export that model
module.exports = CategorySelectionschema;

