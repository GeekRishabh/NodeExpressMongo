var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');
// See http://mongoosejs.com/docs/schematypes.html

var Account = new Schema({
	name: String,
	username: String,
    password: String,
    verified:Number,
    token:String,
	dateAdded : { type: Date, default: Date.now },
});

Account.plugin(passportLocalMongoose);
// export 'Animal' model so we can interact with it in other files
module.exports = mongoose.model('Account',Account);