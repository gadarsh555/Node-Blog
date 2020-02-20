var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var uniqueValidator = require('mongoose-unique-validator');

mongoose.connect('mongodb://localhost/nodeblog',{
    useNewUrlParser: true,
   useCreateIndex: true,
   useUnifiedTopology: true 
});

var db = mongoose.connection;

// user schema

var UserSchema = mongoose.Schema({
    name : {
        type : String,
        required: true,
        index : true
    },
    username : {
        type : String,
        required: true,
        unique: true
    },
    email : {
        type : String,
        required: true,
        unique: true
    },
    password : {
        type : String,
        required: true
    },
    profileimage : {
        type : String,
        required: true
    }
});

UserSchema.plugin(uniqueValidator);

var User = module.exports = mongoose.model('User',UserSchema);

module.exports.createUser = function(newUser,callback){
    bcrypt.genSalt(10, function(err, salt) {
       var hash = bcrypt.hashSync(newUser.password,salt);
       newUser.password = hash;
       newUser.save(callback);
  });
   
  }