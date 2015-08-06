/** FileStorage Lib 
 *	@description generalized lib for file storage so the service/platform used for storage can be changed without affecting file storage calls
 */
var q = require('q'),
_ = require('underscore'),
s3 = require('./s3'),
formidable = require('formidable');


var bucketKeyPrefix = "hypercube-test1-";

exports.createBucket = function(bucketName){
	console.log('[fileStorage.createBucket()]');
	return s3.createBucketSite(bucketName);
};
exports.deleteBucket = function(bucketName){
	return s3.deleteBucket(bucketName);
};
exports.uploadFiles = function(bucketName, localDir){
	return s3.uploadFiles(bucketName, localDir);
};
//Get files stored within a bucket
exports.getFiles = function(bucketName){
	return s3.getFiles(bucketName);
};
exports.getBuckets = function(bucketName, localDir){
	return s3.getBuckets(bucketName, localDir);
};
exports.saveFile = function(bucketName, fileData){
	if(!_.has(fileData, 'key')){
		console.error('File key required to save');
	}
	if(!_.has(fileData, 'content')){
		console.error('File content required to save');
	}
	console.log('calling s3.saveFile with BucketName:' + bucketName + " key: " + fileData);
	return s3.saveFile(bucketName, fileData);
};
//TODO: Make a stream version of this
exports.uploadFiles = function(bucketName, uploadReq){
	var localDirectory;
	var d = q.defer();
	var self = this;
	//TODO: make sure request even has files?
	var uploadDir = "fs/uploads/" + bucketName;
	//Accept files from form upload and save to disk
	var form = new formidable.IncomingForm(),
  files = [],
  fields = [];
  form.uploadDir = uploadDir
  form.keepExtensions = true;
  //Create new local directory for files
	mkdirp(uploadDir, function(err) { 
    // path was created unless there was error
    if(err){
    	console.error('Error creating a local directory for file upload: ', err);
    	return d.reject(err);
    }
    //Parse form
    form.parse(req, function(err){
    	if(err){
    		console.log('error parsing form:', err);
    		d.reject(err);
    	}
    	console.log('Form parsed')
    });
	});
  //TODO: Handle on error?
  form
    .on('fileBegin', function(name, file) {
    	var pathArray = file.path.split("/");
    	var path = _.initial(pathArray);
    	path = path.join("/") + "/" + file.name;
    	file.path = path;
		})
    .on('field', function(field, value) {
      // console.log(field, value);
      //Handle form fields other than files
      fields.push([field, value]);
    })
    .on('file', function(field, file) {
      // console.log(field, file);
      //Handle form files
      files.push([field, file]);
    })
    .on('end', function() {
      console.log('-> upload done');
      console.log('received files:\n\n '+util.inspect(files));
      // res.writeHead(200, {'content-type': 'text/plain'});
      // res.write('received fields:\n\n '+util.inspect(fields));
      // res.write('\n\n');
      // res.end('received files:\n\n '+util.inspect(files));
  		//TODO: Upload files from disk to S3
  		console.log('upload localdir called with:', self.location);
			fileStorage.uploadLocalDir({bucket:self.location, localDir:uploadDir}).then(function (){
				//TODO: Remove files from disk
				console.log('files upload successful:');
				rimraf(uploadDir, function (err){
					if(!err){
						d.resolve();
					} else {
						console.log('Error deleting folder after upload to template');
						d.reject(err);
					}
				});
			}, function (err){
				d.reject(err);
			});
    });
  return d.promise;
};
exports.uploadLocalDir = function(uploadData){
	return s3.uploadDir(uploadData.bucket, uploadData.localDir);
};
exports.signedUrl = function(urlData){
	urlData.bucket = urlData.bucket;
	return s3.getSignedUrl(urlData);
};