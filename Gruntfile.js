module.exports = function(grunt){
	var serverFolder = "backend/";
	var frontFolder = "public/";
	grunt.initConfig({
		concurrent:{
			tasks:['watch','nodemon'],
			logCuncurrentOutput:true
		},
		watch:{
			server:{
				files:['Gruntfile.js', 'config/**', serverFolder + 'lib/**', serverFolder + 'controllers/**'],
				tasks:['nodemon']
			}
		},
		nodemon:{
			local:{
				script: 'bin/www',
				ignore:['node_modules/**']
			}
		},
		apidoc: {
			app:{
				src: serverFolder+ "controllers",
	    	dest: frontFolder + "docs/",
	    	options:{
	    		debug:true
	    	}
			}
		}
	});
	require('load-grunt-tasks')(grunt);
	grunt.registerTask('default', ['nodemon']);
};
