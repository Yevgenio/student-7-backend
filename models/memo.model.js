const mongoose = require('mongoose');

const memoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  type: String,
  category: String,
  imagePath: {type: String, default: "default"},
  startsAt: { type: Date, default: Date.now }, 
  endsAt: Date, 
  createdAt: { type: Date, default: Date.now }, 
});

module.exports = mongoose.model('Memo', memoSchema);