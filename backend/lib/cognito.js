// Amazon Cognito Interface

var AWS = require('aws-sdk');
AWS.config.region = 'us-east-1';

var cognitoidentity = new AWS.CognitoIdentity();
var q = require('q');

exports.getToken = function(userId){
	return getOpenIdToken(userId);
};
//Get Cognito Open Id Token
function getOpenIdToken(userId){
	var d = q.defer();
  var cognitoidentity = new AWS.CognitoIdentity();
  if(!userId){
  	console.log('UserId is required to get cognito identity');
  	d.reject({message:'UserId is required to get cognito identity'});
  } else {
  	var params = {
    IdentityPoolId: 'us-east-1:7f3bc1ff-8484-48dd-9e13-27e5cd3de982',
	     Logins: {
	        hypercubeUserId: userId.toString()
	     }
	  };
	  cognitoidentity.getOpenIdTokenForDeveloperIdentity(params, function(err, data) {
	     if (err) { console.log(err, err.stack); d.reject({failure: 'Connection failure'}); }
	     else {
	        console.log('Cognito getOpenIdToken responded:'.rainbow, data); // so you can see your result server side
	        d.resolve(data);
	     }
	  });
  }
	return d.promise;
}
