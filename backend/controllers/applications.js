/**
 * @description Application Controller
 */
var Application = require('../models/application').Application;
var mongoose = require('mongoose');
var url = require('url');
var _ = require('underscore');
var q = require('q');
/**
 * @api {get} /applications Get Applications list
 * @apiName GetApplication
 * @apiGroup Application
 *
 * @apiParam {String} name Name of Application
 *
 * @apiSuccess {Object} applicationData Object containing applications data.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "name": "App1",
 *       "owner": {username:"Doe"}
 *     }
 *
 */
exports.get = function(req, res, next){
	var isList = true;
	var query = Application.find({}).populate({path:'owner', select:'username name title email'});
	if(req.params.name){ //Get data for a specific application
		console.log('application request with id:', req.params.name);
		query = Application.findOne({name:req.params.name}).populate({path:'owner', select:'username name title email'});
		isList = false;
	}
	query.exec(function (err, result){
		if(err) { return next(err);}
		if(!result){
			return next (new Error('Application could not be found'));
		}
		res.send(result);
	});
};

/**
 * @api {post} /applications Add a new application
 * @apiName AddApplication
 * @apiGroup Application
 *
 * @apiParam {String} name Name of application
 *
 * @apiSuccess {Object} applicationData Object containing newly created applications data.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "name": "App1",
 *       "owner": {username:"Doe"}
 *     }
 *
 *
 */
exports.add = function(req, res, next){
	//Query for existing application with same _id
	if(!_.has(req.body, "name")){
		res.status(400).send("Name is required to create a new app");
	} else {
		console.log('add request with name: ' + req.body.name + ' with body:', req.body);
		var appData = _.extend({}, req.body);
		if(!_.has(appData, 'owner')){
			console.log('No owner provided. Using user', req.user);
			appData.owner = req.user.id;
		}
		var query = Application.findOne({"name":req.body.name}); // find using name field
		query.exec(function (qErr, qResult){
			if (qErr) { return next(qErr); }
			if(qResult){ //Matching application already exists
				return next(new Error('Application with this name already exists.'));
			}
			//application does not already exist
			var application = new Application(appData);
			console.log('about to call create with storage:', appData);
			application.createWithStorage().then(function(newApp){
				console.log('Application created:', newApp);
				res.json(newApp);
			}, function(err){
				console.log('Error creating new application:', err);
				//TODO: Handle different errors here
				res.status(400).json(err);
			});
		});
	}
};

/**
 * @api {put} /applications Update a application
 * @apiName UpdateApplication
 * @apiGroup Application
 *
 * @apiParam {String} name Name of application
 * @apiParam {Object} owner Owner of application
 * @apiParam {String} owner.username Application owner's username
 *
 * @apiSuccess {Object} applicationData Object containing updated applications data.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "name": "App1",
 *       "owner": {username:"Doe"}
 *     }
 *
 *
 */
exports.update = function(req, res, next){
	console.log('app update request with name: ' + req.params.name + ' with body:', req.body);
	if(req.params.name){
		Application.update({name:req.params.name}, req.body, {upsert:false}, function (err, numberAffected, result) {
			if (err) { return next(err); }
			//TODO: respond with updated data instead of passing through req.body
			res.json(req.body);
		});
	} else {
		res.status(400).send({message:'Application id required'});
	}
};

/**
 * @api {delete} /application/:id Delete an application
 * @apiName DeleteApplication
 * @apiGroup Application
 *
 * @apiParam {String} name Name of application
 *
 * @apiSuccess {Object} applicationData Object containing deleted applications data.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "name": "App1",
 *       "owner": {username:"Doe"}
 *     }
 *
 *
 */
exports.delete = function(req, res, next){
	console.log('delete request:', req.params);
	var query = Application.findOneAndRemove({'name':req.params.name}); // find and delete using id field
	query.exec(function (err, result){
		if (err) { return next(err); }
		if (!result) {
			console.log('no result');
			return next(new Error('Application could not be deleted.'));
		}
		var app = new Application(result);
		app.removeStorage().then(function(){
			res.json(result);
		}, function(err){
			res.status(400).send(err);
		});
	});
};


/**
 * @api {put} /applications/:name/  Update a application
 * @apiName Files
 * @apiGroup Application
 *
 * @apiParam {String} name Name of application to get files for
 *
 * @apiSuccess {Object} applicationData Object containing updated applications data.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "name": "App1",
 *       "owner": {username:"Doe"}
 *     }
 *
 *
 */
exports.files = function(req, res, next){
	console.log('file upload request with app name: ' + req.params.name + ' with body:', req.body);
	//TODO: Check that user is owner or collaborator before uploading
	//TODO: Lookup application and run uploadFile function
	if(req.params.name){ //Get data for a specific application
		var query = Application.findOne({name:req.params.name}).populate({path:'owner', select:'username name title email'});
		isList = false;
		query.exec(function (err, foundApp){
			if(err) { return next(err);}
			if(!foundApp){
				return next (new Error('Application could not be found'));
			}
			console.log('foundApp:', foundApp);
			foundApp.getStructure().then(function (appFiles){
				console.log('appFiles returned:', appFiles);
				res.send(appFiles);
			}, function (err){
				res.status(400).send('Error saving file:', err);
			});
		});
	} else {
		res.status(400).send('Application name and fileData are required to upload file')
	}
};

/**
 * @api {put} /applications/:name/  Update a application
 * @apiName UploadFile
 * @apiGroup Application
 *
 * @apiParam {String} name Name of
 * @apiParam {String} content Text string content of file
 * @apiParam {String} filetype Type of file the be uploaded
 *
 * @apiSuccess {Object} applicationData Object containing updated applications data.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "name": "App1",
 *       "owner": {username:"Doe"}
 *     }
 *
 *
 */
 var localDir = "./public";
exports.publishFile = function(req, res, next){
	console.log('dir upload request with app name: ' + req.params.name + ' with body:', req.body);
	//TODO: Check that user is owner or collaborator before uploading
	//TODO: Lookup application and run uploadFile function
	if(req.params.name){ //Get data for a specific application
		var query = Application.findOne({name:req.params.name}).populate({path:'owner', select:'username name title email'});
		isList = false;
		query.exec(function (err, foundApp){
			if(err) { return next(err);}
			if(!foundApp){
				return next (new Error('Application could not be found'));
			}
			console.log('foundApp:', foundApp);
			//TODO: Get url from found app, and get localDir from
			foundApp.publishFile({content:req.body.content, key:req.body.key, contentType:req.body.contentType}).then(function (webUrl){
				console.log('Buckets web url:', webUrl);
				res.send(webUrl);
			}, function (err){
				console.log('Error publishing file:', err);
				res.status(400).send(err);
			});
		});
	} else {
		res.status(400).send('Application name and fileData are required to upload file')
	}
};
