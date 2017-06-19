// Karma configuration
// Generated on Tue Apr 07 2015 23:14:35 GMT-0600 (MDT)

module.exports = function(config) {
  config.set({
    basePath: '',
    singleRun: true,
    autoWatch: false,
    frameworks: ['mocha', 'chai'],
    files: [
      'node_modules/wicg-inert/dist/inert.min.js',
      'dist/*.js',
      'helpers.js',
      'test/*.js',

      // fixtures
      { pattern: 'test/fixtures/*.html', watched: true, served: true, included: false }
    ],
    browsers: ['PhantomJS'],
    reporters: ['progress', 'coverage'],
    preprocessors: {
      'dist/*.js': ['coverage']
    },
    coverageReporter: {
      dir : 'coverage/',
      reporters: [
        {type: 'lcov', subdir: '.'},
        {type: 'text-summary'}
      ]
    }
  });
};
