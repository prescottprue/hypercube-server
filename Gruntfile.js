var conf = require('./config.json');
module.exports = function(grunt){
	var serverFolder = "backend/";
	var frontFolder = "public/";
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
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
				ignore:['node_modules/**'],
				options: {
          nodeArgs: ['--debug'],
	        env:{
	        	PORT:conf.port
	        }
        },

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
		},
		shell: {
    	mongodb: {
      	command: 'mongod --dbpath /data/db',
      	options: {
          async: true,
          stdout: false,
          stderr: true,
          failOnError: true,
          execOptions: {
            cwd: '.'
          }
      	}
  		}
		}
	});
	require('load-grunt-tasks')(grunt);
	grunt.registerTask('default', ['shell:mongodb', 'nodemon']);
};
