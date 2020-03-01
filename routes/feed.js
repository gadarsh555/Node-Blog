var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var User = require('../models/user');
var Post = require('../models/post');
var Rating = require('../models/rating');
var Friend = require('../models/friend');
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

router.get('/:id/home',(req,res)=>{
  User.findOne({"username" : req.params.id}, (err,user) => {
    if(err){
        throw err;
    }
    else if(user){
        console.log("user logged in : ",user);
        req.session.user = user;
        Friend.findOne({"user" : req.params.id},(err,people)=>{
            if(err){
              console.log("error ocurred in getting friends",err);
              res.redirect('/login');
            }//if
            else if(people){
                var promise = [];
                for(var i=0;i<people.friend.length;i++){
                    promise.push(new Promise((resolve)=>{
                          Post.findOne({"postedby" : people.friend[i]},(err,post)=>{
                          if(err){
                            console.log("error ocurred in getting posts",err);
                            res.redirect('/login');
                          }//if
                          else{
                              console.log("friend posts are :",post);
                              resolve(post);
                          }//else
                        });//getting the posts of all the users
                    })
                    );//pushing all the promise in the array
                }//for
                var promise2 = [];
                Promise.all(promise)
                      .then(allPost =>{
                            console.log("got all the posts from all the friends : ",allPost);
                            for(var i=0;i<allPost.length;i++){
                              promise2.push(new Promise((resolve)=>{
                                    User.findOne({"username" : allPost[i].postedby},(err,profile)=>{
                                    if(err){
                                      console.log("error ocurred in getting posts",err);
                                      res.redirect('/login');
                                    }//if
                                    else{
                                        var data = {
                                          "username" : profile.username,
                                          "name"     : profile.name,
                                          "profileimage" : profile.profileimage
                                        };
                                        console.log("friend data are :",data);
                                        resolve(data);
                                    }//else
                                  });//getting the profifleiamge of all the user friends
                              })
                              );//pushing all the promise in the array
                            }//for
                            var promise3 = [];
                            var promise4 = [];
                            Promise.all(promise2)
                                   .then(friendData =>{
                                       
                                        console.log("got all the profile images of all the friends",friendData);
                                        /* getting the post reactions of the current user */
                                    for(var i=0;i<allPost.length;i++){
                                      promise4.push(new Promise((resolve)=>{
                                            for(var j=0;j<allPost[i].feed.length;j++){
                                              var postid = allPost[i].feed[j].postid;
                                          promise3.push(new Promise((resolve)=>{
                                                Rating.findOne({"postid" : postid,"reaction.riseupby" : req.params.id},(err,riseup)=>{
                                                if(err){
                                                  console.log("error ocurred in getting reaction",err);
                                                  res.redirect('/login');
                                                }//if
                                                else if(riseup){
                                                    var reaction = true;
                                                    console.log("reaction data are :",reaction);
                                                    resolve(reaction);
                                                }//elseif
                                                else{
                                                     /*  checking for falldown */
                                                     Rating.findOne({"postid" : postid,"reaction.falldownby" : req.params.id},(err,falldown)=>{
                                                      if(err){
                                                      console.log("error ocurred in getting reaction",err);
                                                        res.redirect('/login');
                                                      }//if
                                                      else if(falldown){
                                                          var reaction = false;
                                                          console.log("reaction data are :",reaction);
                                                          resolve(reaction);
                                                      }//elseif
                                                      else{
                                                          var reaction = null;
                                                          console.log("reaction data is null:",reaction);
                                                          resolve(reaction);
                                                      }//else
                                                  });//getting the falldown reaction status of all the user 
                                                }//else
                                              });//getting the riseup reaction status of all the user friends
                                          }));//pushing all the promise in the array promise3
                                          }//for
                                          /* calling promise 3 */
                                          Promise.all(promise3)
                                          .then(data =>{
                                          console.log("succesfully got the reaction of a user",data);
                                           resolve(data);
                                          })//then
                                          .catch(err => console.log("error ocurred in promise3",err));
                                        }));//pushing all the promise in the array promise4
                                        }//for
                                        /* getting the post reaction of the current user */
                                Promise.all(promise4)
                                    .then(reaction =>{
                                    console.log("succesfully got the reactions of all the users",reaction);
                                      res.render('home',{user : user,post:allPost,friendData : friendData,reaction : reaction});
                                    })//then
                                    .catch(err => console.log("error ocurred in promise3",err));
                                    })//then
                                   .catch(err => console.log("error ocurred in promise2",err));//catch
                      })//then
                      .catch(err => console.log("error ocurred in promise",err));//catch
            }//elseif
        });//getting all the friends of the user
    }//else
});//findone
});//home

router.get('/:id/addPost', checkSignIn,function(err,req,res,next){
    console.log("i am inside addPost ");
      console.log("error : ",err);
      res.redirect('../../../login');
  },function(req,res){
    var user = {
      "username" : req.params.id,
      "name" : req.query.name,
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
    
    var user = {
      "username" : req.params.id,
      "name" : req.query.name,
      "profileimage" : req.query.profileimage
   };
   
   Post.findOne({"postedby" : req.params.id},(err,post)=>{
      console.log("number of posts already are :",post.feed.length);
       var count  =  post.feed.length+1;
       var postid =  req.params.id+'_'+count;
       var feed = {
        "postid"    : postid,
        "title"     : req.body.title,
        "text"      : req.body.text,
        "postimage" : req.body.postimage,
        "postdate"  : uploadDate,
        "posttime"  : uploadTime,
        "timestamp" : timeStamp
    };
    Post.findOneAndUpdate({ "postedby" : req.params.id},{$push :{ "feed" : feed }},(err,post)=>{
      if(err){
        console.log("error in saving in databse : ",err);
       res.render('addPost',{user:user,postStatus : "Failed to Post"});
      }//if
      else if(post){
        console.log("post saved successfully ",post);
            //including the post in rating db
              var rate = new Rating({
                "postid" : postid,
                "reaction.riseupby"   : [],
                "reaction.falldownby" : [],
                "comment" : [],
                "share"   : []
              });
              rate.save((err,ratePost)=>{
                if(err){
                  console.log("error in saving in databse : ",err);
                  res.render('addPost',{user:user,postStatus : "Failed to Post"});
                }//if
                else if(ratePost){
                  console.log("saved rate post in databse : ",ratePost);
                  res.render('addPost',{user:user,postStatus : "Successfully Posted"});
                }//else
              });//saving the post in rating db
      }//elseif
      else{
        res.render('addPost',{user:user,postStatus : "Failed to Post"});
      }//else
     });//post saving in db
   });//finding the count of previous posts
   
  });//route to save post in db
  
  router.get('/:id/photos', checkSignIn,function(err,req,res,next){
    console.log("i am inside photos ");
      console.log("error : ",err);
      res.redirect('../../../login');
  },function(req,res){
    var user = {
      "username" : req.params.id,
      "name" : req.query.name,
      "profileimage" : req.query.profileimage
   };
    console.log("successfully reached in photos with authentucatiuon");
    Post.findOne({"postedby" : req.params.id },(err,post)=>{
      if(err){
        console.log("error:",err);
        res.render('photos',{user:user,photoStatus : "Error in getting your Photos"});
      }//if
      else if(post.feed.length > 0){
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