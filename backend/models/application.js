var db = require('./../lib/db');
var mongoose = require('mongoose');
var fileStorage = require('../lib/fileStorage');
var q = require('q');
var ApplicationSchema = new mongoose.Schema({
	owner:{type: mongoose.Schema.Types.ObjectId, ref:'User'},
	name:{type:String, default:'', unique:true, index:true},
	clients:[{url:{type:String, default:''}, provider:{type:String, default:''}, bucketName:{type:String, default:''}}],
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
		fileStorage.createBucketSite(this.name).then(function(bucket){
			var clientInfo = {url:newApplication.url, bucketName:newApplication.name, provider:"Amazon"};
			if(self.client){
				self.client.push(clientInfo) ;
			} else {
				self.client = [clientInfo];
			}
			self.saveNew().then(function (appWithStorage){
				console.log("AppsWithStorage saved with storage:", appWithStorage);
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
	saveFile: function(){
		//TODO: Make this work
		return fileStorage.saveFile();
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