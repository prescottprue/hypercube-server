var db = require('./../lib/db');
var mongoose = require('mongoose');
var fileStorage = require('../lib/fileStorage');
var q = require('q');
var ApplicationSchema = new mongoose.Schema({
	owner:{type: mongoose.Schema.Types.ObjectId, ref:'User'},
	name:{type:String, default:'', unique:true, index:true},
	frontend:{
		url:{type:String, default:''}, 
		provider:{type:String, default:'Amazon'}, 
		bucketName:{type:String, default:''}, 
		files:[{
			path:{type:String, default:''}, 
			name:{type:String, default:''}, 
			filetype:{type:String, default:''}
		}]
	},
	server:{
		url:{type:String, default:''}, 
		provider:{type:String, default:'Heroku'}, 
		appName:{type:String, default:''}
	},
	groups:[{type:mongoose.Schema.Types.ObjectId, ref:'Group'}],
	collaborators:[{type: mongoose.Schema.Types.ObjectId, ref:'User'}],
	createdAt: { type: Date, default: Date.now},
	updatedAt: { type: Date, default: Date.now}
});

ApplicationSchema.set('collection', 'applications');

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
		fileStorage.createBucket(this.name).then(function(bucket){
			console.log("[createStorage()] New storage created:", bucket);
			self.frontend = {url:bucket.url, bucketName:bucket.name, provider:'Amazon'};
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
	selectTemplate:function(){

	},
	removeStorage:function(){
		var d = q.defer();
		fileStorage.deleteAppBucket(this.name).then(function (){
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
	saveFile: function(fileData){
		//TODO: Make this work
		var d = q.defer();
		var self = this;
		fileStorage.saveFile(fileData).then(function (newFile){
			if(!self.frontend.files){
				self.frontend.files = [];
			} else {
				//TODO: Get specific data from newFile 
				self.frontend.files.push(newFile);
			}
			self.saveNew().then(function (appWithFile){
				console.log('[saveFile()]AppsWithStorage saved with file:', appWithFile);
				d.resolve(appWithFile);
			}, function (err){
				console.log('[saveFile()]AppsWithStorage error saving application after adding file:', err);
				d.reject(err);
			});
		}, function (err){
			console.log('[saveFile()]AppsWithStorage error saving file:', err);
			d.reject(err);
		});
		return d.promise;
	},
	signedUrl:function(urlData){
		return fileStorage.signedUrl(urlData);
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