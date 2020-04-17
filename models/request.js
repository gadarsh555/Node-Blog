var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

/* mongoose.connect('mongodb://localhost/nodeblog',{
    useNewUrlParser: true,
   useCreateIndex: true,
   useUnifiedTopology: true,
    useFindAndModify: false 
});

var db = mongoose.connection; */

// post schema

var RequestSchema = mongoose.Schema({
	user: {
		type: String,
		unique: true,
		require: true
	},
	request: [
		{
			username: {
				type: String,
				unique: false
			},
			name: String,
			profileimage: String
		}
	]
});

RequestSchema.plugin(uniqueValidator);

var Request = (module.exports = mongoose.model('Request', RequestSchema));
