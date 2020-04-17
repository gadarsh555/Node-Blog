var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
const db = 'mongodb+srv://gadarsh555:ucantcme@social-network-a0bj4.mongodb.net/test?retryWrites=true&w=majority;';

mongoose.connect(db, {
	useNewUrlParser: true,
	useFindAndModify: false,
	useCreateIndex: true,
	useUnifiedTopology: true
});
/* mongoose.connect('mongodb://localhost/nodeblog',{
    useNewUrlParser: true,
   useCreateIndex: true,
   useUnifiedTopology: true 
});

var db = mongoose.connection; */

// post schema

var PostSchema = mongoose.Schema({
	postedby: {
		type: String,
		require: true
	},
	feed: [
		{
			postid: {
				type: String,
				required: true
			},
			title: {
				type: String,
				required: true,
				index: true
			},
			text: {
				type: String
			},
			postimage: {
				type: String
			},
			postdate: {
				type: String
			},
			posttime: {
				type: String
			},
			timestamp: {
				type: Number
			}
		}
	]
});

PostSchema.plugin(uniqueValidator);

var Post = (module.exports = mongoose.model('Post', PostSchema));
