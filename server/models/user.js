var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  hsId: Number,
  displayName: String,
  email: String,
  image: String,
  credits: { type: Number, default: 0 }
}, {
  // we need to set this so empty object can be persisted
  minimize: false
});

userSchema.statics.getUserById = function (id, cb) {
  this.model('User').find({ hsId: id }, cb);
}

userSchema.methods.addCredit = function (cb) {
  this.credits += 1;
  this.save(cb);
}

module.exports = mongoose.model('User', userSchema);