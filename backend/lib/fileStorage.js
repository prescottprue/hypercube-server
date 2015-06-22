/** FileStorage Lib 
 *	@description generalized lib for file storage so the services can be changed without affecting file storage calls
 */
var q = require('q'),
_ = require('underscore'),
s3 = require('./s3');


var bucketKeyPrefix = "hypercube-app-";

exports.createBucket = function(appName){
	console.log('[fileStorage.createBucket()]');
	return s3.createBucketSite(bucketKeyPrefix + appName);
};
exports.deleteAppBucket = function(appName){
	return s3.deleteBucket(bucketKeyPrefix + appName);
};
exports.deleteBucket = function(bucketName){
	return s3.deleteBucket(bucketName);
};
exports.uploadFiles = function(appName, localDir){
	return s3.uploadFiles(bucketKeyPrefix + appName, localDir);
};
exports.getBuckets = function(appName, localDir){
	return s3.getBuckets(bucketKeyPrefix + appName, localDir);
};
	//File type if statements
	// if (fileType=='html') {
	// 	contentType = 'text/html'
	// } else if(fileType=='js') {
	// 	contentType = 'application/javascript'
	// } else if(fileType=='css') {
	// 	contentType = 'text/css'
	// } else if(fileType=='json') {
	// 	contentType = 'application/json'
	// } else if(fileType=='jpg'||fileType=='jpeg'||fileType=='jpe') {
	// 	contentType = 'image/jpeg'
	// } else if(fileType=='png') {
	// 	contentType = 'image/png'
	// } else if(fileType=='gif') {
	// 	contentType = 'image/gif'
	// } else if(fileType=='svg') {
	// 	contentType = 'image/svg+xml'
	// } else {
	// 	contentType = 'application/octet-stream'
	// }