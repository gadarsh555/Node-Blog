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
    feed : [{
                postid : {
                    type : String,
                    required : true
                },
                title : {
                    type : String,
                    required: true,
                    index : true
                },
                text : {
                    type : String
                },
                postimage : {
                    type : String
                },
                postdate : {
                    type : String
                },
                posttime : {
                    type : String
                },
                timestamp : {
                    type : Number
                }
            }]
});

PostSchema.plugin(uniqueValidator);

var Post = module.exports = mongoose.model('Post',PostSchema);
