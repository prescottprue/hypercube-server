var db = require('./../lib/db');
var mongoose = require('mongoose');

var ApplicationSchema = new mongoose.Schema({
	owner:{type: mongoose.Schema.Types.ObjectId, ref:'User'},
	name:{type:String, default:'', unique:true, index:true},
	groups:[{type:mongoose.Schema.Types.ObjectId, ref:'Group'}],
	createdAt: { type: Date, default: Date.now},
	updatedAt: { type: Date, default: Date.now}
});

ApplicationSchema.set('collection', 'applications');
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