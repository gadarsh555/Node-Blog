var express = require('express');
var router = express.Router();
var Post = require('../models/post');
var bcrypt = require('bcryptjs');
var User = require('../models/user');
var multer = require('multer');
var upload = multer({ dest: './public/uploads/postimage' });
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var Friend = require('../models/friend');

//handle sessions
router.use(
	session({
		secret: 'secret', // this is to encrypt and decrypt all the
		// cookie values or user data
		saveUninitialized: true, // dont save unmodified
		resave: true, // forces the session to be saved back to the store
		duration: 10 * 1000 // define the time interval for which
		// user will be logged in afetr that session
		// session will expire and user will be logged out

		/* saveUnitialized prevents your router from 
   overloading with too many empty sessions 
   and resave is to ensure sessions are not 
    deleted even if they are idle for a long time. */
	})
);

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('login');
});

router.post('/', (req, res) => {
	console.log('reached here in login.js');

	console.log('password : ', req.body.password);
	try {
		User.findOne({ email: req.body.email }, (err, user) => {
			if (err) {
				throw err;
			}
			if (!user) {
				console.log('user not found in : ');
				res.redirect('/login');
			} else {
				//if
				console.log('hashed pass fdrom db : ', user.password);
				comparePassword(req.body.password, user.password, (err, isPasswordMatch) => {
					console.log('passowrd match status : ', isPasswordMatch);
					if (isPasswordMatch) {
						console.log('user logged in : ', user);
						req.session.user = user;
						res.render('home', { user: user });
						//res.redirect('/login/' + user.username + '/home');
					} else {
						//ispasswordmatch
						console.log('Password not matched', err);
						res.redirect('/login');
					}
				}); //comparepassowrd
			} //else
		}); //findone
	} catch (error) {
		//try
		console.log('error in catch : ', error.name);
	} //catch
}); //router-post

router.get(
	'/:id/people',
	checkSignIn,
	function(err, req, res, next) {
		console.log('i am inside people ');
		console.log('error : ', err);
		res.redirect('../../../login');
	},
	function(req, res) {
		var user = {
			username: req.params.id,
			name: req.query.name,
			profileimage: req.query.profileimage
		};
		console.log('successfully reached in people with authentucatiuon');
		console.log('user data in people :', user);
		User.find({}, (err, people) => {
			if (err) {
				console.log('error in finding people : ', err);
				res.render('people', { user: user, peopleStatus: 'Cannot find people due to an error' });
			} else if (people.length > 0) {
				//if
				console.log('people found successfully ');
				res.render('people', { user: user, people: people, peopleStatus: 'People Available are :' });
			} else if (people.length == 0) {
				//elseif
				console.log('no people found successfully ');
				res.render('people', { user: user, peopleStatus: 'No People are Available Around You :' });
			} else {
				//elseif
				res.render('people', { user: user, peopleStatus: 'No people found around you' });
			} //else
		}); //userfind
		/* res.render('people',{user:user}); */
	}
);

// Logout endpoint
router.get('/:id/logout', function(req, res) {
	req.session.destroy();
	/* res.send("logout success!"); */
	console.log('Logout successful :');
	res.redirect('/login');
});

function checkSignIn(req, res, next) {
	if (req.session.user) {
		next(); //If session exists, proceed to page
	} else {
		var err = new Error('Not logged in!');
		console.log(req.session.user);
		next(err); //Error, trying to access unauthorized page!
	}
}

//funcxtion to compare the hashewd password
function comparePassword(plainPass, hashword, callback) {
	var isPasswordMatch = bcrypt.compareSync(plainPass, hashword);
	return callback(null, isPasswordMatch);
}

module.exports = router;
