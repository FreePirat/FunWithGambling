const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String, default: '' },
  profilePicture: { type: String, default: '' },
  coins: { type: Number, default: 1000 }
});

const User = mongoose.model('User', userSchema);

module.exports = User;