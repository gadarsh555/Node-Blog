var express = require('express');
var router = express.Router();
var Post = require('../models/post');
var bcrypt = require('bcryptjs');
var User = require('../models/user');
var multer = require('multer');
var upload = multer({dest:'./public/uploads/postimage'});
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

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


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login');
});

router.get('/:id/home',(req,res)=>{
  User.findOne({"username" : req.params.id}, (err,user) => {
    if(err){
        throw err;
    }
    else{
        console.log("user logged in : ",user);
        req.session.user = user;
        res.render('home',{user : user});
    }
});//findone
});//home

router.post('/',(req,res) => {
    console.log('reached here in login.js');
   
    console.log("password : ",req.body.password);
    try {
      User.findOne({"email" : req.body.email}, (err,user) => {
        if(err){
            throw err;
        }
        if(!user){
          console.log("user not found in : ");
          res.redirect('/login');
        }//if
        else{
            console.log("hashed pass fdrom db : ",user.password);
            comparePassword(req.body.password,user.password,(err,isPasswordMatch)=>{
              console.log("passowrd match status : ",isPasswordMatch)
            if(isPasswordMatch){
            console.log("user logged in : ",user);
            req.session.user = user;
            res.redirect('/login/'+user.username+'/home');
            }//ispasswordmatch
            else{
              console.log("Password not matched",err);
              res.redirect('/login');
            }
          });  //comparepassowrd
        }//else
    });//findone
    }//try
     catch (error) {
      console.log("error in catch : ",error.name);
    }//catch
     
});//router-post

router.get('/logout', function(req, res){
  req.session.destroy(function(){
     console.log("user logged out.")
  });
  res.redirect('/');
});

router.get('/:id/people', checkSignIn,function(err,req,res,next){
  console.log("i am inside people ");
    console.log("error : ",err);
    res.redirect('../../../login');
},function(req,res){
  var user = {
    "username" : req.params.id,
    "profileimage" : req.query.profileimage
 };
  console.log("successfully reached in people with authentucatiuon");
  console.log("user data in people :",user);
  res.render('people',{user:user});
});

router.get('/:id/addPost', checkSignIn,function(err,req,res,next){
  console.log("i am inside addPost ");
    console.log("error : ",err);
    res.redirect('../../../login');
},function(req,res){
  var user = {
    "username" : req.params.id,
    "profileimage" : req.query.profileimage
 };
  console.log("successfully reached in addPost with authentucatiuon");
  console.log("user data in addPost :",user);
  res.render('addPost',{user:user});
});

router.post('/:id/addPost', checkSignIn , function(err,req,res,next){
  console.log("i am inside post method addPost ");
  console.log("error : ",err);
  res.redirect('../../../login');
},upload.single('postimage'),function(req,res){
  let date_ob = new Date();
  // current date
  // adjust 0 before single digit date
  let date = ("0" + date_ob.getDate()).slice(-2);
  // current month
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  // current year
  let year = date_ob.getFullYear();
  // current hours
  let hours = date_ob.getHours();
  // current minutes
  let minutes = date_ob.getMinutes();
  // current seconds
  let seconds = date_ob.getSeconds();
  // prints date in YYYY-MM-DD format
  var uploadDate = year + "-" + month + "-" + date;
  // prints date & time in YYYY-MM-DD HH:MM:SS format
  var uploadTime =  hours + ":" + minutes + ":" + seconds;
  let ts = Date.now(); // timestamp
  var timeStamp = Math.floor(ts/1000);//time stamp in seconds
  console.log("Reached in post add section");
   
  if(req.file){
    console.log("got the image");
    req.body.postimage = "../../../uploads/postimage/"+req.file.filename;
  }
  else{
   console.log("no image");
   req.body.postimage = "noimage";
  }
  console.log("body has :",req.body);
  req.body.postedby = req.params.id;
  req.body.riseup = 0;
  req.body.falldown = 0;
  req.body.postdate = uploadDate;
  req.body.posttime = uploadTime;
  
  var user = {
    "username" : req.params.id,
    "profileimage" : req.query.profileimage
 };
 var post = new Post(req.body);

  post.save((err,post)=>{
      if(err){
        console.log("error in saving in databse : ",err);
       res.render('addPost',{user:user,postStatus : "Failed to Post"});
      }//if
      else if(post){
        console.log("post saved successfully ");
        res.render('addPost',{user:user,postStatus : "Successfully Posted"});
      }//elseif
      else{
        res.render('addPost',{user:user,postStatus : "Failed to Post"});
      }//else
  });//post saving in db
});

router.get('/:id/photos', checkSignIn,function(err,req,res,next){
  console.log("i am inside photos ");
    console.log("error : ",err);
    res.redirect('../../../login');
},function(req,res){
  var user = {
    "username" : req.params.id,
    "profileimage" : req.query.profileimage
 };
  console.log("successfully reached in photos with authentucatiuon");
  Post.find({"postedby" : req.params.id },(err,post)=>{
    if(err){
      console.log("error:",err);
      res.render('photos',{user:user,photoStatus : "Error in getting your Photos"});
    }//if
    else if(post){
      console.log("got all your photos:",post);
      res.render('photos',{user:user,post : post,photoStatus : "Successfully got your Photos"});
    }//elseif
    else{
      console.log("you have no photos:",post);
      res.render('photos',{user:user,photoStatus : "You Have No Photos"});
    }
  });
  /* res.render('photos',{user:user}); */
});

// Logout endpoint
router.get('/:id/logout', function (req, res) {
  req.session.destroy();
  /* res.send("logout success!"); */
  console.log("Logout successful :");
  res.redirect('../../../login');
});

function checkSignIn(req,res,next){
  if(req.session.user){
     next();     //If session exists, proceed to page
  } else {
     var err = new Error("Not logged in!");
     console.log(req.session.user);
     next(err);  //Error, trying to access unauthorized page!
  }
}

//funcxtion to compare the hashewd password
function comparePassword(plainPass, hashword, callback) {
  var isPasswordMatch =  bcrypt.compareSync(plainPass, hashword);
  return callback(null,isPasswordMatch);
};

module.exports = router;
