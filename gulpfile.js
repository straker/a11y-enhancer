var gulp = require('gulp');
var babel = require('gulp-babel');
var rollup = require('gulp-rollup');
var concat = require('gulp-concat-util');
var rename = require("gulp-rename");
var browserSync = require('browser-sync').create();

gulp.task('connect', function() {
  browserSync.init({
    port: 8080,
    open: false,
    server: {
      baseDir: "./",
    }
  });
});

gulp.task('build', function() {
  return gulp.src(['src/*.js'])

    // create js import file
    .pipe(rollup({
      entry: ['src/accordion.js'],
      format: 'umd',
      moduleName: 'a11yEnhancer',
    }))
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest('build'))

    // create html import file
    .pipe(rename(function(path) {
      path.extname = '.html'
    }))
    .pipe(concat.header('<script>\n'))
    .pipe(concat.footer('\n</script>'))
    .pipe(gulp.dest('.'));
});

gulp.task('default', ['connect']);