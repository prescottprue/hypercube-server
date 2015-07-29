/**
 * @description Template Controller
 */
var Template = require('../models/template').Template;
var mongoose = require('mongoose');
var url = require('url');
var _ = require('underscore');
var q = require('q');
/**
 * @api {get} /templates Get Templates list
 * @apiName GetTemplate
 * @apiGroup Template
 *
 * @apiParam {String} name Name of Template
 *
 * @apiSuccess {Object} templateData Object containing templates data.
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
	var query = Template.find({}).populate({path:'owner', select:'username name title email'});
	if(req.params.name){ //Get data for a specific template
		console.log('template request with id:', req.params.name);
		query = Template.findOne({name:req.params.name}).populate({path:'owner', select:'username name title email'});
		isList = false;
	}
	query.exec(function (err, result){
		if(err) { return next(err);}
		if(!result){
			return next (new Error('Template could not be found'));
		}
		res.send(result);
	});
};

/**
 * @api {post} /templates Add a new template
 * @apiName AddTemplate
 * @apiGroup Template
 *
 * @apiParam {String} name Name of template
 *
 * @apiSuccess {Object} templateData Object containing newly created template's data.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "name": "template1",
 *       "owner": {"username":"testUser"}
 *     }
 *
 */
exports.add = function(req, res, next){
	//Query for existing template with same name
	if(!_.has(req.body, "name")){
		res.status(400).send("Name is required to create a new app");
	} else {
		console.log('add request with name: ' + req.body.name + ' with body:', req.body);
		var appData = _.extend({}, req.body);
		if(!_.has(appData, 'owner')){
			console.log('No owner provided. Using user', req.user);
			appData.owner = req.user.id;
		}
		var query = Template.findOne({"name":req.body.name}); // find using name field
		query.exec(function (qErr, qResult){
			if (qErr) { return next(qErr); }
			if(qResult){ //Matching template already exists
				return next(new Error('Template with this name already exists.'));
			}
			//template does not already exist
			var template = new Template(appData);
			template.createNew().then(function (newTemplate){
				console.log('Template created successfully:', newTemplate);
				res.json(newTemplate);
			}, function(err){
				console.log('Error creating new template:', err);
				//TODO: Handle different errors here
				res.status(400).json(err);
			});
		});
	}
};

/**
 * @api {put} /templates Update a template
 * @apiName UpdateTemplate
 * @apiGroup Template
 *
 * @apiParam {String} name Name of template
 * @apiParam {Object} owner Owner of template
 * @apiParam {String} owner.username Template owner's username
 *
 * @apiSuccess {Object} templateData Object containing updated templates data.
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
		Template.update({name:req.params.name}, req.body, {upsert:false}, function (err, numberAffected, result) {
			if (err) { return next(err); }
			//TODO: respond with updated data instead of passing through req.body
			res.json(req.body);
		});
	} else {
		res.status(400).send({message:'Template id required'});
	}
};

/**
 * @api {delete} /delete/:id Delete an delete
 * @apiName DeleteTemplate
 * @apiGroup Template
 *
 * @apiParam {String} name Name of delete
 *
 * @apiSuccess {Object} templateData Object containing deleted templates data.
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
	var query = Template.findOneAndRemove({'name':req.params.name}); // find and delete using id field
	query.exec(function (err, result){
		if (err) { return next(err); }
		if (!result) {
			console.log('no result');
			return next(new Error('Template could not be deleted.'));
		}
		var app = new Template(result);
		app.removeStorage().then(function(){
			res.json(result);
		}, function(err){
			res.status(400).send(err);
		});
	});
};
