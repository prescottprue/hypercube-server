var db = require('./../lib/db');
var mongoose = require('mongoose');
var fileStorage = require('../lib/fileStorage');
var q = require('q');
var _ = require('underscore');
var sqs = require('./../lib/sqs');
var templateBucket = "hypercube-templates";

var TemplateSchema = new mongoose.Schema({
	name:{type:String, default:'', unique:true, index:true},
	location:{type:String},
	createdAt: { type: Date, default: Date.now},
	updatedAt: { type: Date, default: Date.now}
});

TemplateSchema.set('collection', 'applications');

TemplateSchema.methods = {
	saveNew: function(){
		var d = q.defer();
		if(!this.location){
			//Build location off of safe version of name
			//TODO: Make this the safe version of name
			this.location = templateBucket + '/' + this.name;
		}
		this.save(function (err, newTemplate) {
			if (err) { 
				console.error('[Template.saveNew()] Error saving Template:', err);
				return d.reject(err); 
			}
			if (!newTemplate) {
				console.error('[Template.saveNew()] Template could not be saved');
				return d.reject(Error('Template could not be saved.'));
			}
			d.resolve(newTemplate);
		});
		return d.promise;
	},
	uploadFiles:function(req){
		var bucketName,localDirectory;
		var d = q.defer();

		//Accept files from form upload and save to disk
		var form = new formidable.IncomingForm(),
        files = [],
        fields = [];

    form.uploadDir = "fs";
    //TODO: Handle on error?
    form
      .on('field', function(field, value) {
        console.log(field, value);
        fields.push([field, value]);
      })
      .on('file', function(field, file) {
        console.log(field, file);
        files.push([field, file]);
      })
      .on('end', function() {
        console.log('-> upload done');
        res.writeHead(200, {'content-type': 'text/plain'});
        res.write('received fields:\n\n '+util.inspect(fields));
        res.write('\n\n');
        res.end('received files:\n\n '+util.inspect(files));
    		//TODO: Upload files from disk to S3
				fileStorage.uploadDir(self.location, localDirectory).then(function (){
					//TODO: Remove files from disk
					d.resolve(newTemplate);
				}, function (err){
					d.reject(err);
				});
      });
    //Parse form
    form.parse(req, function(err){
    	if(err){
    		d.reject(err);
    	}
    });
    return d.promise;
	},
	createNew: function(){
		var d = q.defer();
		var self = this;
		//TODO: Verify that name is allowed to be used for bucket
		this.saveNew().then(function (){

		}, function (err){
				d.reject(err);
			});
		return d.promise;
	}
};

/*
 * Construct `User` model from `UserSchema`
 */
db.hypercube.model('Template', TemplateSchema);

/*
 * Make model accessible from controllers
 */
var Template = db.hypercube.model('Template');
Template.collectionName = TemplateSchema.get('collection');

exports.Template = db.hypercube.model('Template');
