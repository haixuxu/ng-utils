'use strict';
var pkg = require('./package.json');

var AUTOPREFIXER_BROWSERS = ["Android >= 4", "Explorer >= 9", "iOS >= 6"];
var filename = 'vm2-utils';
// == PATH STRINGS ========
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var del = require('del');
var moment = require('moment');
var ncp = require('ncp').ncp;
ncp.limit = 16;

var banner = '/**\n * ng-utils \n * version: ' + pkg.version + ' \n * repo: https://github.com/x373241884y/ng-utils \n * build: ' + moment().format('YYYY-MM-DD HH:mm:ss') + '\n */\n';

// == PIPE SEGMENTS ========

gulp.task('less', function () {
    gulp.src(['src/less/index.less'])
        .pipe(plugins.less())
        .pipe(plugins.autoprefixer({browsers: AUTOPREFIXER_BROWSERS, cascade: false}))
        .pipe(plugins.rename(filename+'.css'))
        .pipe(gulp.dest('test/css/'));
});

gulp.task('concat', function () {
    gulp.src(['src/prefix', 'src/directives/**/*.js','src/suffix'])
        .pipe(plugins.concat(filename+'.js'))
        .pipe(plugins.beautify({indent_size: 4}))
        .pipe(gulp.dest('test/js/'));
});

gulp.task('watch', function () {
    gulp.watch('src/less/**/*.less', ['less']);
    gulp.watch('src/directives/**/*.js', ['concat']);
});

gulp.task('dev', ['less', 'concat', 'watch']);
gulp.task('doc', ['less', 'concat'],function (done) {
    ncp('test/', 'docs/', function (err) {
        if (err) {
            return console.error(err);
        }
        done();
    });
});
gulp.task('default', ['less', 'concat'],function (done) {
    gulp.src(['test/css/'+filename+'.css', 'test/js/'+filename+'.js'])
        .pipe(gulp.dest('dist/'));
});