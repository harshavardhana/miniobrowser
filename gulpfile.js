var del = require('del');
var gulp = require('gulp');
var less = require('gulp-less');
var server = require('gulp-webserver');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var mainBowerFiles = require('gulp-main-bower-files');
var flatten = require('gulp-flatten');
var minifyCSS = require('gulp-minify-css');
var rename = require('gulp-rename');


var path = {
    main : './app/app.js',
    html : './app/index.html',
    less : './app/less/**/*.less',
    img : './app/img/*',
    font : ['node_modules/material-design-iconic-font/dist/fonts/*', 'node_modules/roboto-fontface/fonts/*']
}

// -------------------------------------
// Tasks
// -------------------------------------

gulp.task('clean', function() {
  return del(['dist']);
});

gulp.task('font', function() {
  return gulp.src(path.font)
    .pipe(gulp.dest('dist/fonts'))
});

gulp.task('img', function() {
    return gulp.src(path.img)
        .pipe(gulp.dest('dist/img'))
});

gulp.task('main', function() {
  return browserify({entries: path.main,
                     extensions: ['.js']}).transform(babelify, {presets: ["es2015", "react"]})
    .bundle()
    .pipe(source('main.js'))
    .pipe(gulp.dest('dist'))
});

gulp.task('html', function() {
  return gulp.src(path.html)
    .pipe(gulp.dest('dist'))
});

gulp.task('less', function () {
    return gulp.src('app/less/main.less')
        .pipe(less())
        .pipe(gulp.dest('dist/css'))
        .pipe(minifyCSS())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('dist/css'))
});


gulp.task('watch', function() {
    gulp.watch(path.less, ['less']);
    gulp.watch(path.html, ['html']);
});


gulp.task('build', ['main', 'html', 'img', 'font', 'less']);

gulp.task('serve', ['build'], function() {
  gulp.src('dist')
    .pipe(server({
      livereload: true,
      open: true
    }));
});

gulp.task('default', ['build']);
