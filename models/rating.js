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

var RatingSchema = mongoose.Schema({
	postid: {
		type: String,
		unique: true,
		require: true
	},
	reaction: {
		riseupby: [
			{
				type: String
			}
		],
		falldownby: [
			{
				type: String
			}
		]
	},
	comment: [
		{
			username: {
				type: String
			},
			name: {
				type: String
			},
			profileimage: {
				type: String
			},
			commentbody: {
				type: String
			}
		}
	],
	share: [
		{
			type: String
		}
	]
});

RatingSchema.plugin(uniqueValidator);

var Rating = (module.exports = mongoose.model('Rating', RatingSchema));
