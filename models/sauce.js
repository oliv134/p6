const mongoose = require('mongoose');

// Sauce data model
const sauceSchema = mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  manufacturer: { type: String, required: true },
  description: { type: String, required: true },
  mainPepper: { type: String, required: true },
  imageUrl: { type: String, required: true },
  heat: { type: Number, required: true},
  likes: { type: Number, required: true, min : 0 , 'default' : 0 },
  dislikes: { type: Number, required: true, min : 0 , 'default' : 0 },
  usersLiked: { type : Array, required: true , 'default' : [] },
  usersDisliked: { type : Array, required: true , 'default' : [] },
});

module.exports = mongoose.model('sauce', sauceSchema);