/**
 * @description Authentication controller
 */
var mongoose = require('mongoose');
var url = require('url');
var _ = require('underscore');

var User = require('../models/user').User;
var Session = require('../models/session').Session;


/**
 * @api {post} /signup Sign up a new user and start a session as that new user
 * @apiName Signup
 * @apiGroup Auth
 *
 * @apiParam {Number} id Users unique ID.
 * @apiParam {String} username Username of user to signup as.
 * @apiParam {String} email Email of user to signup as.
 * @apiParam {String} password Password of user to signup as.
 *
 * @apiSuccess {Object} userData Object containing users data.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "name": "John",
 *       "title": "Doe",
 *     	 "role":"admin",
 *     }
 *
 */
exports.signup = function(req, res, next){
	var query;
	console.log('Signup request with :', req.body);
	//Check for username or email
	if(!_.has(req.body, "username") && !_.has(req.body, "email")){
		res.status(400).json({code:400, message:"Username or Email required to signup"});
	}
	if(_.has(req.body, "username")){
		query = User.findOne({"username":req.body.username}); // find using username field
	} else {
		query = User.findOne({"email":req.body.email}); // find using email field
	}
	query.exec(function (qErr, qResult){
		if (qErr) { return next(qErr); }
		if(qResult){ //Matching user already exists
			// TODO: Respond with a specific error code
			return next(new Error('User with this information already exists.'));
		}
		//user does not already exist
		//Build user data from request
		var userData = _.pick(req.body, ["username", "email", "name", "role", "title"]);
		var user = new User(userData);
		// TODO: Start a session with new user
		user.createWithPass(req.body.password).then(function(newUser){
			res.send(newUser);
		}, function(err){
			res.status(500).json({code:500, message:'Error hashing password', error:err});
		});
	});
};

/**
 * @api {post} /login Login and start a new session
 * @apiName Login
 * @apiGroup Auth
 *
 * @apiParam {Number} id Users unique ID.
 * @apiParam {String} username Username of user to login as.
 * @apiParam {String} email Email of user to login as.
 * @apiParam {String} password Password of user to login as.
 *
 * @apiSuccess {Object} userData Object containing users data.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "name": "John",
 *       "title": "Doe",
 *     	 "role":"admin",
 *     }
 *
 */
exports.login = function(req, res, next){
	console.log('[AuthCtrl.login] Login request with :', req.body);
	var query;
	if(!_.has(req.body, "username") && !_.has(req.body, "email")){
		res.status(400).json({code:400, message:"Username or Email required to login"});
	} else {
		if(_.has(req.body, "username")){
			query = User.findOne({"username":req.body.username}); // find using username field
		} else {
			query = User.findOne({"email":req.body.email}); // find using email field
		}
		console.log('login user query:', query);
		query.exec(function (err, currentUser){
			if(err) { console.error('login error:', err);
				return next(err);}
			if(!currentUser){
				console.error('user not found');
				return next (new Error('User could not be found'));
			}
			console.log('[AuthCtrl.login] User found:', currentUser);
			currentUser.login(req.body.password).then(function(token){
				console.log('[AuthCtrl.login] Login Successful. Token:', token);
				res.send({token:token, user:currentUser.strip()});
			}, function(err){
				//TODO: Handle wrong password
				res.status(400).send('Login Error:', err);
			});
		});
	}
	
};

/**
 * @api {post} /logout Logout and invalidate token
 * @apiName Logout
 * @apiGroup Auth
 *
 * @apiSuccess {Object} userData Object containing users data.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "Logout successful"
 *     }
 *
 */
exports.logout = function(req, res, next){
	//TODO:Invalidate token
	var user = new User(req.user);
	console.log('ending users session:', user);
	user.endSession().then(function(){
		console.log('successfully ended session');
		res.status(200).send({message:'Logout successful'});
	}, function(){
		console.log('Error ending session');
		res.send({message:'Error ending session'});
	});
};

/**
 * @api {put} /verify Verify token and get user data
 * @apiName Verify
 * @apiGroup Auth
 *
 * @apiSuccess {Object} userData Object containing users data.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "name": "John",
 *       "title": "Doe",
 *     	 "role":"admin",
 *     }
 *
 */
exports.verify = function(req, res, next){
	//TODO:Actually verify user instead of just returning user data
	console.log('verify request:', req.user);
	var query;
	if(req.user){
		//Find by username in token
		if(_.has(req.user, "username")){
			query = User.findOne({username:req.user.username});
		}
		//Find by username in token
		else {
			query = User.findOne({email:req.user.email});
		}
		query.exec(function (err, result){
			console.log('verify returned:', result, err);
			if (err) { return next(err); }
			if(!result){ //Matching user already exists
				// TODO: Respond with a specific error code
				return next(new Error('User with this information does not exist.'));
			}
			res.json(result);
		});
	} else {
		console.log('Invalid auth token');
		res.status(401).json({status:401, message:'Valid Auth token required to verify'});
	}
};