var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

mongoose.connect('mongodb://localhost/nodeblog',{
    useNewUrlParser: true,
   useCreateIndex: true,
   useUnifiedTopology: true 
});

var db = mongoose.connection;

// post schema

var RequestSchema = mongoose.Schema({
    user : {
        type : String,
        require : true
    },
    request :[{
        username : String,
        name : String,
        profileimage : String
    }]
});

RequestSchema.plugin(uniqueValidator);

var Request = module.exports = mongoose.model('Request',RequestSchema);
