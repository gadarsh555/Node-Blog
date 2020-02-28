var express = require('express');
var router = express.Router();
var User = require('../models/user');
var multer = require('multer');
var passport = require('passport');
var upload = multer({dest:'./public/uploads/profileimage'});
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var expressValidator = require('express-validator');
var Friend = require('../models/friend');
//handle sessions
router.use(session({
  secret:'secret', // this is to encrypt and decrypt all the
                   // cookie values or user data
  saveUninitialized :true,// dont save unmodified
  resave:true,  // forces the session to be saved back to the store
  duration: 10*1000,// define the time interval for which
          // user will be logged in afetr that session
          // session will expire and user will be logged out
      
   /* saveUnitialized prevents your router from 
   overloading with too many empty sessions 
   and resave is to ensure sessions are not 
    deleted even if they are idle for a long time. */
}));
// passport

router.use(passport.initialize());
router.use(passport.session());

// validator

router.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.post('/',upload.single('profileimage'),(req,res) => {
   console.log('reached here in index.js');
  
   
   if(req.file){
     console.log("got the image");
     req.body.profileimage = "../../../uploads/profileimage/"+req.file.filename;
   }
   else{
    console.log("no image");
    req.body.profileimage = "../../../uploads/profileimage/"+'default.png';
   }

   req.checkBody('name',"Name is Required").notEmpty();
   req.checkBody('username',"Username is Required").notEmpty();
   req.checkBody('email',"Email is Required").notEmpty();
   req.checkBody('email',"Email is Invalid").isEmail();
   req.checkBody('password',"Password is Required").notEmpty();

   var errors = req.validationErrors(); // storing all the errors in the array
   if (errors) {
     console.log("validation errors ");
     res.render('index',{errors : errors , formData : req.body});
   }
   // check if emaikl is already presetn
   User.findOne({"email":req.body.email}, (err,user)=>{
    if(err){
      console.log("error in findone email : ",err.name);
    }
    if(user){
      console.log("email is already present : ",user);
      res.render('index',{emailPresent : "Email is Already Present." , formData : req.body});
    }
    else{
      //check if the username is alrwady presetrn
      User.findOne({"username":req.body.username}, (err,user)=>{
        if(err){
          console.log("error in findone username : ",err.name);
        }
        if(user){
          console.log("username is already present : ",user);
          res.render('index',{usernamePresent : "Username is Already taken." , formData : req.body});
        }
        else{
          var user = new User(req.body);
          console.log(user);
          User.createUser(user, (err,user) => {
            if(err){
             console.log("error in createuser : ",err);
            }
            else{
               var friend = new Friend({
                user : req.body.username,
                friend :  req.body.username
              });
              friend.save((err,friend)=>{
                 if(err){
                  console.log("error in createuser : ",err);
                 }
                 else {
                  console.log("user registered : ",user);
                  req.session.user = user;
                  res.redirect('/login/'+user.username+'/home');
                 }
              });//saving self in friend 
            }//else
          });//create-user
        }//else
      });//findone- username
    }//else
   });//findone email

});//router-post



module.exports = router;
