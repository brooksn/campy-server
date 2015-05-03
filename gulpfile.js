var gulp = require('gulp');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
//var jscs = require('gulp-jscs');

gulp.task('jshint', function(){
  return gulp.src('*.js')
    //.pipe(jscs({ esnext: true }))
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter(stylish));
});

gulp.task('default', function() {
  gulp.start('jshint');
});
