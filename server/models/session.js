var mongoose = require('mongoose');

var sessionSchema = mongoose.Schema({
    host: String,
    guest: String,
    description: String,
    time: Date
});

module.exports = mongoose.model('session', sessionSchema);