var gulp = require('gulp');
var babel = require('gulp-babel');
var rollup = require('gulp-rollup');
var concat = require('gulp-concat-util');
var rename = require("gulp-rename");
var browserSync = require('browser-sync').create();
var Server = require('karma').Server;

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
  return gulp.src('src/*.js')

    // create js import file
    .pipe(rollup({
      entry: ['src/accordion.js', 'src/combobox.js', 'src/dialog.js'],
      format: 'umd',
      moduleName: 'a11yEnhancer',
    }))
    .pipe(babel({
      // babel automatically converts the typeof operator into a function to deal
      // with the singular use case of `typeof Symbol() === "symbol"`, even if
      // the code never uses the typeof operator for Symbols...
      // as far as I could find, there is no way to disable a single plugin when
      // using the es2015 preset, so instead we'll have to list all of the plugins
      // manually in the same order as the preset and exclude plugins I don't want:
      // typeof and module plugins (handled by rollup)
      plugins: [
        'babel-plugin-transform-es2015-template-literals',
        'babel-plugin-transform-es2015-literals',
        'babel-plugin-transform-es2015-function-name',
        'babel-plugin-transform-es2015-arrow-functions',
        'babel-plugin-transform-es2015-block-scoped-functions',
        'babel-plugin-transform-es2015-classes',
        'babel-plugin-transform-es2015-object-super',
        'babel-plugin-transform-es2015-shorthand-properties',
        'babel-plugin-transform-es2015-duplicate-keys',
        'babel-plugin-transform-es2015-computed-properties',
        'babel-plugin-transform-es2015-for-of',
        'babel-plugin-transform-es2015-sticky-regex',
        'babel-plugin-transform-es2015-unicode-regex',
        'babel-plugin-check-es2015-constants',
        'babel-plugin-transform-es2015-spread',
        'babel-plugin-transform-es2015-parameters',
        'babel-plugin-transform-es2015-destructuring',
        'babel-plugin-transform-es2015-block-scoping',
        'babel-plugin-transform-regenerator',
      ]
    }))
    .pipe(gulp.dest('dist'))
});

gulp.task('watch', function() {
  gulp.watch('src/*', ['build']);
});

gulp.task('test', function(done) {
  new Server({
    basePath: '',
    frameworks: ['mocha', 'chai'],
    files: [
      'node_modules/wicg-inert/dist/inert.min.js',
      'dist/*.js',
      'helpers.js',
      'test/*.js',

      // fixtures
      { pattern: 'test/fixtures/*.html', watched: true, served: true, included: false }
    ],
    browsers: ['Chrome']
  }, done).start();
});

gulp.task('default', ['connect']);