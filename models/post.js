var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

mongoose.connect('mongodb://localhost/nodeblog',{
    useNewUrlParser: true,
   useCreateIndex: true,
   useUnifiedTopology: true 
});

var db = mongoose.connection;

// post schema

var PostSchema = mongoose.Schema({
    postedby : {
        type : String,
        require : true
    },
    title : {
        type : String,
        required: true,
        index : true
    },
    text : {
        type : String,
        required: true,
        unique: true
    },
    postimage : {
        type : String
    },
    riseup : {
        type : Number
    },
    falldown : {
        type : Number
    },
    postdate : {
        type : String
    },
    posttime : {
        type : String
    }
});

PostSchema.plugin(uniqueValidator);

var Post = module.exports = mongoose.model('Post',PostSchema);
