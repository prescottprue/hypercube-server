// database handler
var conf = require('../config/default');
var mongoose = require('mongoose');
var dbUrl = conf.config.db.url;
if(conf.config.db.name){
	dbUrl += "/" + conf.config.db.name
}
var hypercube = mongoose.createConnection(dbUrl);
hypercube.on('error',function (err) {
	console.log('mongourl:', conf.config.db.url + conf.config.db.name);

	console.error('Mongoose error:', err);
});
hypercube.on('connected', function () {
	console.error('Connected to DB');

});
hypercube.on('disconnected', function () {
	console.error('Disconnected from DB');
});


exports.hypercube = hypercube;

