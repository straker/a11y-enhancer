var gulp = require('gulp');
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

gulp.task('default', ['connect']);