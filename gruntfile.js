/*
install grunt:
npm install -g grunt-cli

then in project dir:
npm install grunt --save-dev
npm init
npm i grunt-contrib-uglify --save-dev
npm i grunt-contrib-concat --save-dev
npm i grunt-contrib-cssmin --save-dev
npm i grunt-contrib-copy --save-dev
npm i grunt-regex-replace --save-dev
npm i grunt-chmod --save-dev
*/

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    uglify: {
      options: {
        // banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
        mangle: false,
        compress: true,
        report: 'min'
      },
      build_site: {
        files: {
          'dist/js/app.min.js': [
                              'src/js/lib/pixi.js',
                              'src/js/lib/headtrackr.min.js',
                              'src/js/gif/gif.js',
                              'src/js/shaders/tv-filter.js',
                              'src/js/shaders/vignette-filter.js',
                              'src/js/easing-float.js',
                              'src/js/facetracker-wrapper.js',
                              'src/js/emoji-textures.js',
                              'src/js/facemoji.js'
                            ]
        }
      }
    },

    concat: {
      dist: {
        src: [
          'src/css/vendornormalize.css',
          'src/css/facemoji.css'
          ],
        dest: 'dist/css/app.min.css',
      },
    },

    copy: {
      main: {
        files: [
          {expand: true, cwd: 'src/', src: ['index.html'], dest: 'dist/'},
          {expand: true, cwd: 'src/', src: ['images/**'], dest: 'dist/'},
          {expand: true, cwd: 'src/', src: ['js/gif/**'], dest: 'dist/'}
        ]
      }
    },

    "regex-replace": {
      cssfile: { //specify a target with any name
        src: ['dist/index.html'],
        actions: [
          {
              name: 'css-replace-start',
              search: '<!-- start.css -->',
              replace: '<link rel="stylesheet" href="css/app.min.css">\n<!-- Source:',
              flags: 'gmi'
          },
          {
              name: 'css-replace-end',
              search: '<!-- end.css -->',
              replace: 'end source -->',
              flags: 'gmi'
          },
          {
              name: 'js-replace-start',
              search: '<!-- start.js -->',
              replace: '<script src="js/app.min.js"></script>\n<!-- Source:',
              flags: 'gmi'
          },
          {
              name: 'js-replace-end',
              search: '<!-- end.js -->',
              replace: 'end source -->',
              flags: 'gmi'
          }
        ]
      }
    }

  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-regex-replace');


  // Default task(s).
  grunt.registerTask('default', ['copy','uglify','concat','regex-replace']);

};