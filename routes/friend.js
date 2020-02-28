var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var User = require('../models/user');
var Post = require('../models/post');
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
     Request.findOne({"user" : req.params.friendid , "request.username" : req.params.id },(err,isrequest)=>{
         if(err){
             console.log("err pccored",err);
             res.render('friend',{user:user,friend:friend,friendStatus :'0'});
         }
         else if(isrequest != null){
            console.log("user is : ",user);
            console.log("person is : ",friend);
            console.log("already request sended");
            res.render('friend',{user:user,friend:friend,friendStatus :'1'});
         }
         else{
            console.log("not sent request");
            Friend.findOne({"user" : req.params.id,"friend" : req.params.friendid},(err,isfriend)=>{
                if(err){
                    console.log("err pccored",err);
                    res.render('friend',{user:user,friend:friend,friendStatus :'0'});
                }
                else if(isfriend != null){
                   console.log("user is : ",user);
                   console.log("person is : ",friend);
                   console.log("already is a friend");
                   res.render('friend',{user:user,friend:friend,friendStatus :'2'});
                }
                else{
                    console.log("not a friend nor a requeesty");
                    res.render('friend',{user:user,friend:friend,friendStatus : '0'});
                }
            })//friend findone
         }
     });//finding is is a frind
});//friend 

router.get('/:id/friend/connect/:friendid', checkSignIn,function(err,req,res,next){

    console.log("i am connect friend request");
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
             res.redirect('/login/'+req.params.id+'/friend/'+req.params.friendid+'?name='+req.query.name+'&profileimage='+req.query.profileimage+'&friend='+req.query.friend+'&friendimage='+req.query.friendimage);
         }
         else if(myrequest != null){
            console.log("found and added request ");
           res.redirect('/login/'+req.params.id+'/friend/'+req.params.friendid+'?name='+req.query.name+'&profileimage='+req.query.profileimage+'&friend='+req.query.friend+'&friendimage='+req.query.friendimage);
         }
         else{
            request.save((err,request)=>{
                if(err){
                    console.log("error in saving in databse : ",err);
                   
                    res.redirect('/login/'+req.params.id+'/friend/'+req.params.friendid+'?name='+req.query.name+'&profileimage='+req.query.profileimage+'&friend='+req.query.friend+'&friendimage='+req.query.friendimage);
                  }//if
                  else if(request){
                    console.log("friend request saved successfully ");
                    
                    res.redirect('/login/'+req.params.id+'/friend/'+req.params.friendid+'?name='+req.query.name+'&profileimage='+req.query.profileimage+'&friend='+req.query.friend+'&friendimage='+req.query.friendimage);
                  }//elseif
                  else{
                   res.redirect('/login/'+req.params.id+'/friend/'+req.params.friendid+'?name='+req.query.name+'&profileimage='+req.query.profileimage+'&friend='+req.query.friend+'&friendimage='+req.query.friendimage);
                  }//else
             });//request saving db
         }//else
     });//findand update
    
});//post

router.get('/:id/friend/delete/:friendid',checkSignIn,(err,req,res,next)=>{
    console.log("i am delete friend request");
    console.log("error : ",err);
    res.redirect('../../../login');
},function(req,res){
   Request.findOneAndUpdate({"user" : req.params.friendid},{$pull: { "request" : { "username": req.params.id }}},(err,deleteRequest)=>{
     if(err){
         console.log("err in removing connect request",err);
         res.redirect('/login/'+req.params.id+'/friend/'+req.params.friendid+'?name='+req.query.name+'&profileimage='+req.query.profileimage+'&friend='+req.query.friend+'&friendimage='+req.query.friendimage);
     }
     else if(deleteRequest != null){
         console.log("sucessfully removed connect request");
         res.redirect('/login/'+req.params.id+'/friend/'+req.params.friendid+'?name='+req.query.name+'&profileimage='+req.query.profileimage+'&friend='+req.query.friend+'&friendimage='+req.query.friendimage);
     }
     else{
        console.log("no connect request");
        res.redirect('/login/'+req.params.id+'/friend/'+req.params.friendid+'?name='+req.query.name+'&profileimage='+req.query.profileimage+'&friend='+req.query.friend+'&friendimage='+req.query.friendimage);
     }
   });//request find and update
});//router delete

router.get('/:id/friend/disconnect/:friendid',checkSignIn,(err,req,res,next)=>{
    console.log("i am delete friend request");
    console.log("error : ",err);
    res.redirect('../../../login');
},function(req,res){
   Friend.findOneAndUpdate({"user" : req.params.id},{$pull: { "friend" : req.params.friendid }},(err,disconnectRequest)=>{
     if(err){
         console.log("err in disconnecting friend",err);
         res.redirect('/login/'+req.params.id+'/friend/'+req.params.friendid+'?name='+req.query.name+'&profileimage='+req.query.profileimage+'&friend='+req.query.friend+'&friendimage='+req.query.friendimage);
     }
     else if(disconnectRequest != null){
         console.log("sucessfully discopnnected friend from your array");
         //to remove you from your friend's array
         Friend.findOneAndUpdate({"user" : req.params.friendid},{$pull: { "friend" : req.params.id }},(err,disconnectMe)=>{
            if(err){
                console.log("err in disconnecting friend",err);
                res.redirect('/login/'+req.params.id+'/friend/'+req.params.friendid+'?name='+req.query.name+'&profileimage='+req.query.profileimage+'&friend='+req.query.friend+'&friendimage='+req.query.friendimage);
            }
            else if(disconnectMe != null){
                console.log("sucessfully discopnnected you from friend array");
                res.redirect('/login/'+req.params.id+'/friend/'+req.params.friendid+'?name='+req.query.name+'&profileimage='+req.query.profileimage+'&friend='+req.query.friend+'&friendimage='+req.query.friendimage);
            }//else if
          });//removing friend from your array 
     }//else if
   });//removing friend from your array 
});//router disconnect

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
          else if(connect != null){
            console.log("got all your requests:",connect);
            console.log("Connect requests is :--------------------------------",req.query.connectRequest);
            res.render('connect',{user:user,connect : connect,connectRequest : req.query.connectRequest,requestStatus : "Successfully got your Requests"});
          }//elseif
          else{
            console.log("you have no requests:",connect);
            res.render('connect',{user:user,connect : connect,connectRequest : req.query.connectRequest,requestStatus : "You Have No Request"});
          }//else
     });//findone
});//get

router.get('/:id/accept/:friendid',checkSignIn,(err,req,res,next)=>{
    console.log("i am inside accept requst");
    console.log("error : ",err);
    res.redirect('../../../login');
},function(req,res){
     console.log("i am inside accept Request of ",req.params.friendid);
     Request.findOneAndUpdate({"user" : req.params.id},{$pull: { "request" : { "username": req.params.friendid }}},(err,accept)=>{
        if(err){
            console.log("error:",err);
            res.redirect('/login/'+req.params.id+'/connect?name='+req.query.name+'&profileimage='+req.query.profileimage);
          }//if
          else if(accept){
            console.log("deleting requests before the requests are accepted:",accept);
            //user find in friend
            Friend.findOneAndUpdate({"user" : req.params.id}, {$push: {"friend": req.params.friendid}},(err,accept)=>{
                if(err){
                    console.log("error in finding",err);
                    res.redirect('/login/'+req.params.id+'/connect?name='+req.query.name+'&profileimage='+req.query.profileimage+'&connectRequest=Connect Request of '+req.params.friendid+' Accepted Successfully');
                }
                else if(accept != null){
                   console.log("found and added the friend in your array ");
                   // adding myselg into friends friend array

                   Friend.findOneAndUpdate({"user" : req.params.friendid}, {$push: {"friend": req.params.id}},(err,acceptRequest)=>{
                    if(err){
                        console.log("error in finding",err);
                        res.redirect('/login/'+req.params.id+'/connect?name='+req.query.name+'&profileimage='+req.query.profileimage+'&connectRequest=Connect Request of '+req.params.friendid+' Accepted Successfully');
                    }
                    else if(acceptRequest != null){
                       console.log("found and added you in the friend's array ");
                       res.redirect('/login/'+req.params.id+'/connect?name='+req.query.name+'&profileimage='+req.query.profileimage+'&connectRequest=Connect Request of '+req.params.friendid+' Accepted Successfully');
                    }//elseif
                });//findand update - updated you in friend's array

                }//else if
            });//findand update - updated your frtiend in your array
           
          }//elseif
          else{
            console.log("you have no accept:",accept);
            res.redirect('/login/'+req.params.id+'/connect?name='+req.query.name+'&profileimage='+req.query.profileimage);
          }
     });//findone
});//get connect request

router.get('/:id/connected',checkSignIn ,function(err,req,res,next){
    console.log("i am inside connected friends");
    console.log("error : ",err);
    res.redirect('../../../login');
},(req,res)=>{
    console.log("i am inside connected friend");
    var user = {
        "username" : req.params.id,
        "name" : req.query.name,
        "profileimage" : req.query.profileimage
     };
     Friend.find({"user" : req.params.id},(err,myfriend)=>{
        if(err){
            console.log("error in finding",err);
            res.redirect('/login/'+req.params.id+'/home');
        }
        else{
           console.log("found all your friends",myfriend);
           if(myfriend[0].friend.length == 1){ 
            res.render('connected',{user: user,friendStatus : "No friends found !"});
           }//if
           else{
                 var friend = [];
                 var promise = [];
                 for(var i = 0 ; i < myfriend[0].friend.length;i++){
                    promise.push(new Promise((resolve)=>{
                                User.findOne({"username" : myfriend[0].friend[i]},(err,data)=>{
                                    var user = {
                                        "name" : data.name,
                                        "username" : data.username,
                                        "profileimage" : data.profileimage
                                    };
                                    resolve(user);
                                });//to find the data of your friend                
                       })//promise
                       );//pushing promise in the array
                  }//for loop to get the detals of all the friends
                    Promise.all(promise)
                        .then(friend => {
                             console.log("got all the friends details threough promise all",friend);
                            res.render('connected',{user: user,people : friend,friendStatus : "Friends found !"});
                        })//then
                        .catch(err => {
                            console.log("error ourred in promise",err.msg);
                            res.render('connected',{user: user,friendStatus : "No Friends found !"});
                        });//catch
                // console.log("details of all your friends are : ",friend);
           }//else
        }//elseif
     });//finding the usernames of all the friends
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