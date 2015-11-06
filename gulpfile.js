var del = require('del');
var gulp = require('gulp');
var sass = require('gulp-sass');
var server = require('gulp-webserver');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');

// -------------------------------------
// Tasks
// -------------------------------------

gulp.task('clean', function() {
  return del(['dist']);
});

gulp.task('font', function() {
  return gulp.src(['node_modules/font-awesome/fonts/*'])
    .pipe(gulp.dest('dist/fonts'))
});

gulp.task('main', function() {
  return browserify({entries: './app/app.js',
                     extensions: ['.js']}).transform(babelify, {presets: ["es2015", "react"]})
    .bundle()
    .pipe(source('main.js'))
    .pipe(gulp.dest('dist'))
});

gulp.task('html', function() {
  return gulp.src('./app/index.html')
    .pipe(gulp.dest('dist'))
});

var normalizeCssPath = require('node-normalize-scss').includePaths;
gulp.task('sass', function () {
  gulp.src('./app/stylesheets/main.scss')
    .pipe(sass({
      includePaths: normalizeCssPath.concat(["node_modules/font-awesome/scss"])
    }).on('error', sass.logError))
    .pipe(gulp.dest('dist'));
});

gulp.task('build', ['sass', 'font', 'main', 'html']);

gulp.task('serve', ['build'], function() {
  gulp.src('dist')
    .pipe(server({
      livereload: true,
      open: true
    }));
});

gulp.task('default', ['build']);
