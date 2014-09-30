var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  displayName: String,
  hsId: String,
  email: String
}, {
  // we need to set this so empty object can be persisted
  minimize: false
});

module.exports = mongoose.model('User', userSchema);
