var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//var passportLocalMongoose = require('passport-local-mongoose');
// See http://mongoosejs.com/docs/schematypes.html

var Person = new Schema({
	email: String,
	username: String,
    password: String,
    verified:Number,
    token:String,
	dateAdded : { type: Date, default: Date.now },
});

//Person.plugin(passportLocalMongoose);
// export 'Animal' model so we can interact with it in other files
module.exports = mongoose.model('Person',Person);