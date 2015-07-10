var db = require('./../lib/db');
var mongoose = require('mongoose');
var fileStorage = require('../lib/fileStorage');
var q = require('q');
var _ = require('underscore');

var ApplicationSchema = new mongoose.Schema({
	owner:{type: mongoose.Schema.Types.ObjectId, ref:'User'},
	name:{type:String, default:'', unique:true, index:true},
	frontend:{
		siteUrl:{type:String, default:''},
		bucketUrl:{type:String, default:''},
		provider:{type:String, default:'Amazon'}, 
		bucketName:{type:String, default:''}
	},
	// server:{
	// 	url:{type:String, default:''}, 
	// 	provider:{type:String, default:'Heroku'}, 
	// 	appName:{type:String, default:''}
	// },
	groups:[{type:mongoose.Schema.Types.ObjectId, ref:'Group'}],
	collaborators:[{type: mongoose.Schema.Types.ObjectId, ref:'User'}],
	createdAt: { type: Date, default: Date.now},
	updatedAt: { type: Date, default: Date.now}
});

ApplicationSchema.set('collection', 'applications');

// Prefix applied to bucketname
var bucketPrefix = "hypercube-test1-";

ApplicationSchema.methods = {
	saveNew: function(){
		var d = q.defer();
		this.save(function (err, newApplication) {
			if (err) { d.reject(err); }
			if (!newApplication) {
				d.reject(Error('Application could not be added.'));
			}
			d.resolve(newApplication);
		});
		return d.promise;
	},
	createStorage:function(){
		console.log('[application.createStorage] called');
		var self = this;
		var d = q.defer();
		var bucketName = bucketPrefix + this.name;
		fileStorage.createBucket(bucketName).then(function(bucket){
			console.log("[createStorage()] New storage created:", bucket);
			// TODO: Add url and website url to frontend data
			self.frontend = {bucketName:bucketName, provider:'Amazon', siteUrl:bucketName+".s3-website-us-east-1.amazonaws.com", bucketUrl:"s3.amazonaws.com/"+bucketName};
			console.log('[createStorage()] about to save new with bucket info:', self);
			self.saveNew().then(function (appWithStorage){
				console.log('[createStorage()]AppsWithStorage saved with storage:', appWithStorage);
				d.resolve(appWithStorage);
			}, function (err){
				d.reject(err);
			});
		}, function (err){
			d.reject(err);
		});
		return d.promise;
	},
	createWithStorage:function(){
		var self = this;
		var d = q.defer();
		console.log('[application.createWithStorage] createWith Storage called');
		this.saveNew().then(function (newApplication){
			console.log('[application.createWithStorage] new app saved successfully', newApplication);
			self.createStorage().then(function(){
				console.log('[application.createWithStorage] storage created successfully', newApplication);
				d.resolve(newApplication);
			}, function(err){
				console.log('[application.createWithStorage] error creating storage', err);
				d.reject(err);
			});
		}, function(err){
			console.log('[application.createWithStorage] error saving new', err);
			d.reject(err);
		});
		return d.promise;
	},
	removeStorage:function(){
		var d = q.defer();
		if(!_.has(this, 'frontend') || !_.has(this.frontend, 'bucketName')){
			console.log('No frontend to remove storage of');
			d.resolve();
		}
		fileStorage.deleteBucket(this.frontend.bucketName).then(function (){
			console.log('Storage removed successfully');
			d.resolve();
		}, function (err){
			if(err && err.code == "NoSuchBucket"){
				console.log('Removing storage was not nessesary');
				d.resolve();
			} else {
				d.reject(err);
			}
		});
		return d.promise;
	},
	publishFile: function(fileData){
		//TODO: Make this work
		var d = q.defer();
		var self = this;
		fileStorage.saveFile(this.frontend.bucketName, fileData).then(function (newFile){
			console.log('[Application.publishFile()] File published:', newFile);
			d.resolve(newFile);
		}, function (err){
			console.log('[Application.publishFile()]AppsWithStorage error saving file:', err);
			d.reject(err);
		});
		return d.promise;
	},
	signedUrl:function(urlData){
		return fileStorage.signedUrl(urlData);
	},
	getStructure:function(){
		return fileStorage.getFiles(this.frontend.bucketName);
	}
};

/*
 * Construct `User` model from `UserSchema`
 */
db.hypercube.model('Application', ApplicationSchema);




/*
 * Make model accessible from controllers
 */
var Application = db.hypercube.model('Application');
Application.collectionName = ApplicationSchema.get('collection');

exports.Application = db.hypercube.model('Application');