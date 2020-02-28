var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

mongoose.connect('mongodb://localhost/nodeblog',{
    useNewUrlParser: true,
   useCreateIndex: true,
   useUnifiedTopology: true 
});

var db = mongoose.connection;

// post schema

var FriendSchema = mongoose.Schema({
    user : {
        type : String,
        require : true
    },
    friend :[{
        type : String
    }]
});

FriendSchema.plugin(uniqueValidator);

var Friend = module.exports = mongoose.model('Friend',FriendSchema);
