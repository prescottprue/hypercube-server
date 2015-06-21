/** s3 connection helpers
 *	@description functionality for accessing/reading/writing to and from S3. These functions are used by files such as fileStorage.js
 */

var aws = require('aws-sdk'),
s3Sdk = require('s3'),
q = require('q'),
_ = require('underscore');


var s3KeyVarName = "HYPERCUBE_S3_KEY";
var s3SecretVarName = "HYPERCUBE_S3_SECRET";
var s3 = configureS3AndGetClient();
/** Set S3 credentials from environment variables if they are availble and return the s3 s3 object
 * @function configureS3AndGetClient
 */
function configureS3AndGetClient(){
	if(_.has(process.env, s3KeyVarName) && _.has(process.env, s3SecretVarName)){
		aws.config.update({
			accessKeyId:process.env[s3KeyVarName],
			secretAccesssKey:process.env[s3SecretVarName]
		});
		//TODO: Configure more settings on s3
		return s3Sdk.createClient({
			s3Options:{
				accessKeyId: process.env[s3KeyVarName],
				secretAccessKey: process.env[s3SecretVarName]
			}
		});
	} else {
		console.error('Environment not setup properly. Check S3 Keys');
	}
}




/** Create new S3 bucket and set default cors settings, and set index.html is website
 * @function createAndConfigS3Bucket
 * @params {string} newBucketName Name of new bucket to create
 */
exports.createBucketSite = function(bucketName){
	console.log('createAndConfigS3Bucket called', bucketName);
	var d = q.defer();
	if(bucketName) {
			createS3Bucket(bucketName).then(function(location){
				console.log('[createAndConfigS3Bucket] createS3Bucket successful:', location);
				setS3Cors(bucketName).then(function(){
					console.log('[createAndConfigS3Bucket] setS3Cors successful');
					setS3Website(bucketName).then(function(){
						console.log('[createAndConfigS3Bucket] setS3Website successful');
						d.resolve(bucketName);
					});
				}, function(err){
					console.error('Error setting new bucket cors config', err);
					d.reject(err);
				});
			}, function(err){
				console.error('Error creating new bucket', err);
				d.reject(err);
			});
	} else {
		d.reject({status:500, message:'Invalid Bucket Name'});
	}
	return d.promise;
}

exports.deleteBucket = function(bucketName){
	return deleteS3Bucket(bucketName);
};





//----------------- Helper Functions ------------------//
/** Set Cors configuration for an S3 bucket
 * @function setS3Cors
 * @params {string} newBucketName Name of bucket to set Cors configuration for
 */
  function setS3Cors(bucketName){
  	console.log('setS3Cors called:', bucketName);
		var s3bucket = new aws.S3();
		var d = q.defer();
		s3bucket.putBucketCors({
			Bucket:bucketName,
			CORSConfiguration:{
				CORSRules: [
		      {
		        AllowedHeaders: [
		          '*',
		        ],
		        AllowedMethods: [
		          'HEAD','GET', 'PUT', 'POST'
		        ],
		        AllowedOrigins: [
		          'http://*', 'https://*'
		        ],
		        // ExposeHeaders: [
		        //   'STRING_VALUE',
		        // ],
		        MaxAgeSeconds: 3000
		      },
		    ]
			}
		}, function(err, data){
			if(err){
				console.error('Error creating bucket website setup');
				d.reject({status:500, error:err});
			} else {
				console.log('bucket cors set successfully resolving:');
				d.resolve();
			}
		});
		return d.promise;
 }

 /** Set website configuration for an S3 bucket
 * @function setS3Website
 * @params {string} newBucketName Name of bucket for which to set website configuration
 */
	function setS3Website(bucketName){
		console.log('setS3Website called:', bucketName);
		var s3bucket = new aws.S3();
		var d = q.defer();
		s3bucket.putBucketWebsite({
			Bucket: bucketName,
			WebsiteConfiguration:{
				IndexDocument:{
					Suffix:'index.html'
				}
			}
		}, function(err, data){
			if(err){
				console.error('Error creating bucket website setup');
				d.reject({status:500, error:err});
			} else {
				console.log('website config set for ' + bucketName, data);
				d.resolve();
			}
		});
		return d.promise;
	}

/** Create a new bucket
 * @function createS3Bucket
 * @params {string} bucketName Name of bucket to create
 */
	function createS3Bucket(bucketName){
		console.log('createS3Bucket called', bucketName)
		var d = q.defer();
		var s3bucket = new aws.S3();
		s3bucket.createBucket({Bucket: bucketName, ACL:'public-read'},function(err, data) {
			if(err){
				console.error('[createS3Bucket] error creating bucket:', err);
				d.reject({status:500, error:err});
			} else {
				console.log('[createS3Bucket] bucketCreated successfully:', data);
				// Setup Bucket website
				var dataContents = data.toString();
				d.resolve(dataContents.locationn);
			}
		});
		return d.promise;
	}

	/** Remove all contents then delete an S3 bucket
 * @function deleteS3Bucket
 * @params {string} bucketName Name of bucket to delete
 */
	function deleteS3Bucket(bucketName){
		console.log('deleteS3Bucket called', bucketName)
		var d = q.defer();
		var s3bucket = new aws.S3();
		// Empty bucket
		var deleteTask = s3.deleteDir({Bucket: bucketName});
		deleteTask.on('error', function(err){
			console.error('error deleting bucket:', err);
			d.reject(err);
		});
		deleteTask.on('end', function(){
			console.log('bucket deleted successfully:');
			// Delete bucket
			s3bucket.deleteBucket({Bucket: bucketName}, function(err, data) {
				if(err){
					console.error('[deleteS3Bucket()] Error deleting bucket:', err);
					d.reject(err);
				} else {
					// Setup Bucket website
					d.resolve({message:'Bucket deleted successfully'});
				}
			});
		});
		return d.promise;
	}

	/** Upload file contents to S3 given bucket, file key and file contents
 * @function uploadFromRamList
 * @params {string} bucketName - Name of bucket to upload to
 * @params {string} fileKey - Key of file to save
 * @params {string} fileContents - File contents in string form
 */
function saveToFileOnS3(bucketName, argFileKey, argFileContents){
	console.log('[saveToFileOnS3] saveToFileOnS3 called', arguments);
	var filePath = argFileKey.replace('%20', '.');
  var d = q.defer();
  var saveParams = {Bucket:bucketName, Key:filePath,  Body: argFileContents};
  console.log('[saveToFileOnS3] saveParams:', saveParams);
  var s3bucket = new aws.S3();
  s3bucket.putObject(saveParams, function(err, data){
  	//[TODO] Add putting object ACL (make public)
    if(!err){
      console.log('[saveToFileOnS3] file saved successfully. Returning:', data);
      d.resolve(data);
    } else {
      console.log('[saveToFileOnS3] error saving file:', err);
      d.reject(err);
    }
  });
  return d.promise;
}
//TODO: MAKE THIS WORK
function copyTemplateToS3(bucketName, templateLocalPath){
	console.log('[saveToFileOnS3] saveToFileOnS3 called', arguments);
	var filePath = argFileKey.replace('%20', '.');
  var d = q.defer();
  var saveParams = {localDir:templateLocalPath, s3Params:{Bucket:bucketName, Key:filePath}};
  console.log('[saveToFileOnS3] saveParams:', saveParams);
  s3.uploadDir(saveParams, function(err, data){
  	//[TODO] Add putting object ACL (make public)
    if(!err){
      console.log('[saveToFileOnS3] file saved successfully. Returning:', data);
      d.resolve(data);
    } else {
      console.log('[saveToFileOnS3] error saving file:', err);
      d.reject(err);
    }
  });
  return d.promise;
}