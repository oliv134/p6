const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// User data model
const userSchema = mongoose.Schema({
  email: { 
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    maxlength: [320, 'Email can\'t be greater than 320 characters'],
    // Using mongoose-unique-validator so two acounts can't be created with the same email
  },
  password: {
    type: String,
    required: true },
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
