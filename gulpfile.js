'use strict';
var config = require('./gulp.conf');


// == PATH STRINGS ========
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var del = require('del');
var es = require('event-stream');
// == PIPE SEGMENTS ========

// == TASKS ========
gulp.task('clean', function () { //clean dist directory
	return del.sync(['./dist/**']);
});
gulp.task('default', ['clean'], function () { //
	return gulp.src(config.resources, {cwd: 'src'})
		.pipe(plugins.concat(config.output.cat))
		.pipe(plugins.beautify({indent_size: 4}))
		.pipe(gulp.dest('./dist'))
		.pipe(plugins.jshint())
		.pipe(plugins.uglify())
		.pipe(plugins.jshint())
		.pipe(plugins.rename(config.output.min))
		.pipe(gulp.dest('./dist'));
});