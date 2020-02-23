var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

mongoose.connect('mongodb://localhost/nodeblog',{
    useNewUrlParser: true,
   useCreateIndex: true,
   useUnifiedTopology: true 
});

var db = mongoose.connection;

// post schema

var PeopleSchema = mongoose.Schema({
    user : {
        type : String,
        require : true
    },
    friend :[{
        type : String
    }]
});

PeopleSchema.plugin(uniqueValidator);

var People = module.exports = mongoose.model('People',PeopleSchema);
