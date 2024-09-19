const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  verified: { type: Boolean, default: false }, // Verification status
  role: { type: String, enum: ['user', 'admin'], default: 'user' } // Add this field
});

userSchema.methods.comparePassword = async function(enteredPassword) {
  return enteredPassword === this.password;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
