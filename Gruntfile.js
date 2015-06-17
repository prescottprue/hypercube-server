module.exports = function(grunt){
	grunt.initConfig({
		concurrent:{
			tasks:['watch','nodemon'],
			logCuncurrentOutput:true
		},
		watch:{
			server:{
				files:['Gruntfile.js', 'config/**', 'lib/**', 'controllers/**'],
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
				src: "controllers",
	    	dest: "public/docs/",
	    	options:{
	    		debug:true
	    	}
			}
		}
	});
	require('load-grunt-tasks')(grunt);
	grunt.registerTask('default', ['nodemon']);
};
