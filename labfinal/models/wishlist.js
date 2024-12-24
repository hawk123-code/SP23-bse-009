const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      productName: { type: String, required: true },
      price: { type: Number, required: true },
    }
  ],
});

module.exports = mongoose.model('wishlist', wishlistSchema);
