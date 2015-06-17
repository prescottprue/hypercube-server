/**
 * @description User controller functions
 */
var mongoose = require('mongoose');
var url = require('url');
var _ = require('underscore');
var w = require('../lib/mongoPromise');

var User = require('../models/user').User;

/**
 * @api {get} /users Get Users List
 * @apiName GetUser
 * @apiGroup User
 *
 * @apiParam {Number} id Users unique ID.
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
exports.get = function(req, res, next){
	var isList = true;
	var query = User.find({});
	if(_.has(req.params, "username")){ //Get data for a specific user
		console.log('user request with username:', req.params.username);
		query = User.findOne({username:req.params.username});
		isList = false;
	}
	w.runQuery(query).then(function(userData){
		//Remove sensitiveuser data from user
		if(!isList){
			userData = userData.strip();
		}
		res.send(userData);
	}, function(err){
		res.status(500).send('User(s) Query error:', err);
	});
};
/**
 * @api {post} /users Add a new user
 * @apiName AddUser
 * @apiGroup User
 *
 * @apiParam {String} username Username of user
 * @apiParam {String} email Email of user
 * @apiParam {String} password Password of user
 * @apiParam {String} name Name of user
 * @apiParam {String} title Title of user
 * @apiParam {Boolean} tempPassword Whether or not to set a temporary password (Also set if there is no password param)
 *
 * @apiSuccess {Object} userData Object containing newly created users data.
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
exports.add = function(req, res, next){
	//Query for existing user with same _id
	var query = User.findOne({"username":req.body.username}); // find using username field
	
	var query;
	if(!_.has(req.body, "username") && !_.has(req.body, "email")){
		res.status(400).json({code:400, message:"Username or Email required to add a new user"});
	}
	if(_.has(req.body, "username")){
		query = User.findOne({"username":req.body.username}); // find using username field
	} else {
		query = User.findOne({"email":req.body.email}); // find using email field
	}
	w.runQuery(query).then(function(){
		var user = new User(req.body);
		user.saveNew().then(function(newUser){
			//TODO: Set temporary password
			res.json(newUser);
		}, function(err){
			console.error('error creating new user:', err);
			res.status(500).send('user could not be added');
		});
	}, function(err){
		//next() //Pass error on
		console.error('error creating new user:', err);
		res.status(500).send({message:'User could not be added.'});
	});
};
/**
 * @api {put} /users Update a user
 * @apiName UpdateUser
 * @apiGroup User
 *
 * @apiParam {String} username Email of user
 * @apiParam {String} password Password of user
 * @apiParam {String} name Name of user
 * @apiParam {String} title Title of user
 * @apiParam {String} role Role of user (admin, user)
 *
 * @apiSuccess {Object} userData Object containing updated users data.
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
exports.update = function(req, res, next){
	if(_.has(req.params, "username")){
		User.update({username:req.params.username}, req.body, {upsert:false}, function (err, numberAffected, result) {
			if (err) { return next(err); }
			//TODO: respond with updated data instead of passing through req.body
			res.json(req.body);
		});
	} else {
		res.status(400).send({message:'User id required'});
	}
};
/**
 * @api {delete} /user/:id Delete a user
 * @apiName DeleteUser
 * @apiGroup User
 *
 * @apiParam {String} username Email of user
 *
 * @apiSuccess {Object} userData Object containing deleted users data.
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
exports.delete = function(req, res, next){
	// var urlParams = url.parse(req.url, true).query;
	if(_.has(req.params, "username")){
		var query = User.findOneAndRemove({'username':req.params.username}); // find and delete using id field
		w.runQuery(query).then(function(result){
			console.log('User deleted successfully:');
			res.json(result);
		}, function(err){
			console.error('User could not be deleted:', err);
			res.status(500).send({message:'User cound not be deleted'});
		});
	}
};