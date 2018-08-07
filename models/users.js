var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var UserSchema   = new Schema({
    email: String,
    locations: [ Object ],
    
});

module.exports = mongoose.model('User', UserSchema);