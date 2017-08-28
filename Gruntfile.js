module.exports = function(grunt) {

	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

		uglify: {
			options: {
				banner: '/*\n <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> \n*/\n'
			},
			build: {
				files: {
					'dist/js/locations_app.js': 'src/js/locations_app.js',
					'dist/js/locations_data.js': 'src/js/locations_data.js',
					'dist/js/map_styles.js': 'src/js/map_styles.js'
				}
			}
		},
		cssmin: {
			options: {
				banner: '/*\n <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> \n/*\n'
			},
			build: {
				files: {
					'dist/css/style.css': 'src/css/style.css'
				}
			}
		},
		htmlmin: {
		    dist: {
		      options: {
		        removeComments: true,
		        collapseWhitespace: true
		      },
		      files: {
		        'dist/index.html': 'src/index.html'
		      }
		    },
		},
		imagemin: {
			static: {
		      options: {
		        optimizationLevel: 5
		      },
		      files: {
		        'dist/img/foursquare.png': 'src/img/foursquare.png'
		      }
		    }
		},
	});
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	grunt.loadNpmTasks('grunt-contrib-imagemin');
	grunt.registerTask('default', ['cssmin', 'uglify', 'htmlmin', 'imagemin']);

};