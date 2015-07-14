// database handler
var conf = require('../config/default');
var mongoose = require('mongoose');
var dbUrl = conf.config.db.url;

//Add db name to url
if(conf.config.db.name){
	dbUrl += "/" + conf.config.db.name
}

console.log('Connecting to mongo url:', dbUrl);
var mongoDb = mongoose.createConnection(dbUrl);

mongoDb.on('error',function (err) {
	console.error('Mongoose error:', err);
});
mongoDb.on('connected', function () {
	console.log('Connected to DB: ' + dbUrl);
});
mongoDb.on('disconnected', function () {
	console.error('Disconnected from DB');
});

exports.hypercube = mongoDb;

