var express = require('express');
var indexCtrls = require('../controllers/index');
var authCtrls = require('../controllers/auth');
var userCtrls = require('../controllers/users');
var appCtrls = require('../controllers/applications');
var rolesCtrl = require('../controllers/roles');

module.exports =  {
	//login(get token)
	//logout (revoke token)
	//signup
	index:[
		{
			type:'GET',
			endpoint:'/',
			controller: indexCtrls.main
		}
	],
	auth:[
		{
			type:'POST',
			endpoint:'/signup',
			controller: authCtrls.signup
		},
		{
			type:'PUT',
			endpoint:'/login',
			controller: authCtrls.login
		},
		{
			type:'PUT',
			endpoint:'/logout',
			controller: authCtrls.logout
		}
	],
	users:[
		{
			type:'GET',
			endpoint: '/user',
			controller:authCtrls.verify
		},
		{
			type:'GET',
			endpoint: '/users',
			controller:userCtrls.get
		},
		{
			type:'GET',
			endpoint: '/users/:username',
			controller:userCtrls.get
		},
		{
			type:'POST',
			endpoint: '/users',
			controller:userCtrls.add
		},
		{
			type:'PUT',
			endpoint: '/user/:username',
			controller:userCtrls.update
		},
		{
			type:'DELETE',
			endpoint: '/users/:username',
			controller:userCtrls['delete']
		}
	],
	applications:[
		{
			type:'GET',
			endpoint: '/apps',
			controller:appCtrls.get
		},
		{
			type:'GET',
			endpoint: '/apps/:name',
			controller:appCtrls.get
		},
		{
			type:'POST',
			endpoint: '/apps',
			controller:appCtrls.add
		},
		{
			type:'PUT',
			endpoint: '/apps/:name',
			controller:appCtrls.update
		},
		{
			type:'DELETE',
			endpoint: '/apps/:name',
			controller:appCtrls['delete']
		}
	],
	roles:[
		{
			type:'GET',
			endpoint: '/roles',
			controller:rolesCtrl.getList
		},
		{
			type:'GET',
			endpoint: '/roles/:name',
			controller:rolesCtrl.get
		},
		{
			type:'POST',
			endpoint: '/roles',
			controller:rolesCtrl.add
		},
		{
			type:'PUT',
			endpoint: '/roles/:name',
			controller:rolesCtrl.update
		},
		{
			type:'DELETE',
			endpoint: '/roles/:name',
			controller:rolesCtrl['delete']
		}
	]
};
