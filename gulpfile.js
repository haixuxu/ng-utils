'use strict';
var config = require('./gulp.conf');
var pkg = require('./package.json');

// == PATH STRINGS ========
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var del = require('del');
var moment = require('moment');

var banner = '/**\n * ng-utils \n * version: ' + pkg.version + ' \n * repo: https://github.com/x373241884y/ng-utils \n * build: ' + moment().format('YYYY-MM-DD HH:mm:ss')+'\n */\n';

// == PIPE SEGMENTS ========

// == TASKS ========
gulp.task('clean', function () { //clean dist directory
	return del.sync(['./dist/**']);
});
gulp.task('default', ['clean'], function () { //
	return gulp.src(config.resources, {cwd: 'src'})
		.pipe(plugins.concat(config.output.cat))
		.pipe(plugins.beautify({indent_size: 4}))
		.pipe(plugins.header(banner,{}))
		.pipe(gulp.dest('./dist'))
		.pipe(plugins.jshint())
		.pipe(plugins.uglify())
		.pipe(plugins.jshint())
		.pipe(plugins.header(banner,{}))
		.pipe(plugins.rename(config.output.min))
		.pipe(gulp.dest('./dist'));
});