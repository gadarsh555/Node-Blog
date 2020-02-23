var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var User = require('../models/user');
var Post = require('../models/post');
var People = require('../models/people');
var Request = require('../models/request');
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

router.get('/:id/friend/:friendid', checkSignIn,function(err,req,res,next){

    console.log("i am inside friend ");
    console.log("error : ",err);
    res.redirect('../../../login');
},function(req,res){
    var user = {
        "username" : req.params.id,
        "name" : req.query.name,
        "profileimage" : req.query.profileimage
     };
     var friend = {
        "username" : req.params.friendid,
        "name" : req.query.friend,
        "profileimage" : req.query.friendimage
     };
     console.log("user is : ",user);
     console.log("person is : ",friend);
     res.render('friend',{user:user,friend:friend});
});//friend 

router.post('/:id/friend/:friendid', checkSignIn,function(err,req,res,next){

    console.log("i am inside friend post");
    console.log("error : ",err);
    res.redirect('../../../login');
},function(req,res){
    var user = {
        "username" : req.params.id,
        "name" : req.query.name,
        "profileimage" : req.query.profileimage
     };
     var friend = {
        "username" : req.params.friendid,
        "name" : req.query.friend,
        "profileimage" : req.query.friendimage
     };
     var request = new Request({
        "user" : req.params.friendid,   
        "request" : user
        });
     Request.findOneAndUpdate({"user" : req.params.friendid}, {$push: {"request": user}},(err,myrequest)=>{
         if(err){
             console.log("error in finding",err);
             res.render('friend',{user:user,friend:friend});
         }
         else if(myrequest){
            console.log("found and added ");
            res.render('friend',{user:user,friend:friend});
         }
         else{
            request.save((err,request)=>{
                if(err){
                    console.log("error in saving in databse : ",err);
                    res.render('friend',{user:user,friend:friend});
                  }//if
                  else if(request){
                    console.log("post saved successfully ");
                    res.render('friend',{user:user,friend:friend});
                  }//elseif
                  else{
                    res.render('friend',{user:user,friend:friend});
                  }//else
             });//request saving db
         }//else
     });//findand update
    
});//post

router.get('/:id/connect', checkSignIn,function(err,req,res,next){

    console.log("i am inside connect");
    console.log("error : ",err);
    res.redirect('../../../login');
},function(req,res){
    var user = {
        "username" : req.params.id,
        "name" : req.query.name,
        "profileimage" : req.query.profileimage
     };
     Request.findOne({"user" : req.params.id},(err,connect)=>{
        if(err){
            console.log("error:",err);
            res.render('connect',{user:user,requestStatus : "Error in getting your Requests"});
          }//if
          else if(connect){
            console.log("got all your requests:",connect);
            res.render('connect',{user:user,connect : connect,requestStatus : "Successfully got your Requests"});
          }//elseif
          else{
            console.log("you have no requests:",connect);
            res.render('connect',{user:user,connect : connect,requestStatus : "You Have No Request"});
          }
     });//findone
});//get

/* router.get('/:id/connectRequest',checkSignIn,(err,req,res,next)=>{
    console.log("i am inside connect");
    console.log("error : ",err);
    res.redirect('../../../login');
},function(req,res){
    var user = {
        "username" : req.params.id,
        "name" : req.query.name,
        "profileimage" : req.query.profileimage
     };
     console.log("i am inside connect Request");
     Request.findOne({"user" : req.params.id},(err,request)=>{
        if(err){
            console.log("error:",err);
            res.render('connect',{user:user,requestStatus : "Error in getting your Requests"});
          }//if
          else if(connect){
            console.log("got all your requests:",connect);
            res.render('connect',{user:user,connect : connect,requestStatus : "Successfully got your Requests"});
          }//elseif
          else{
            console.log("you have no requests:",connect);
            res.render('connect',{user:user,connect : connect,requestStatus : "You Have No Request"});
          }
     });//findone
});//get connect request */

function checkSignIn(req,res,next){
    if(req.session.user){
       next();     //If session exists, proceed to page
    } else {
       var err = new Error("Not logged in!");
       console.log(req.session.user);
       next(err);  //Error, trying to access unauthorized page!
    }
  }

module.exports = router;