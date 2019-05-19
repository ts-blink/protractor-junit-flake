'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _child_process = require('child_process');

var _junitXml = require('./junit-xml');

var _parseOptions = require('./parse-options');

var _parseOptions2 = _interopRequireDefault(_parseOptions);

require('core-js/shim');

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

exports['default'] = function () {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var callback = arguments.length <= 1 || arguments[1] === undefined ? function noop() {} : arguments[1];

  var parsedOptions = (0, _parseOptions2['default'])(options);
  var testAttempt = parsedOptions.testAttempt || 1;
  var logger = new _logger2['default'](parsedOptions.color);

  function rerunFailedTests() {
    var failedSpecNames = (0, _junitXml.processResults)(parsedOptions.resultsXmlPath);

    logger.log('info', 'Re-running tests: test attempt ' + testAttempt + '\n');
    if (failedSpecNames.length === 0) {
      logger.log('info', '\nNo failed specs were found. Not re-running tests.\n\n');
      return;
    } else {
      logger.log('info', 'Re-running:', failedSpecNames.length, ' tests');
    }
    var specRegex = failedSpecNames.join('|');
    startProtractor(specRegex, true);
  }

  function handleTestEnd(status) {
    var output = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

    logger.log('Test Ended', status, output);
    if (status === 0) {
      callback(status);
    } else {
      if (++testAttempt <= parsedOptions.maxAttempts) {
        rerunFailedTests();
      }
      callback(status, output);
    }
  }

  function startProtractor() {
    var specRegex = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
    var retry = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

    var output = '';
    var protractorArgs = [parsedOptions.protractorPath].concat(parsedOptions.protractorArgs);

    if (retry) {
      protractorArgs.push('--params.flake.retry', true);
    }

    if (specRegex) {
      protractorArgs.push('--jasmineNodeOpts.grep', specRegex);
    }

    protractorArgs.push('--testAttempt', testAttempt);

    var protractor = (0, _child_process.spawn)(parsedOptions.nodeBin, protractorArgs, parsedOptions.protractorSpawnOptions);

    protractor.stdout.on('data', function (buffer) {
      var text = buffer.toString();
      logger.protractor(text);
      output = output + text;
    });

    protractor.stderr.on('data', function (buffer) {
      var text = buffer.toString();
      logger.protractor(text);
      output = output + text;
    });

    protractor.on('exit', function (status) {
      handleTestEnd(status, output);
    });
  }

  if (testAttempt > 1 && testAttempt <= parsedOptions.maxAttempts) {
    rerunFailedTests();
  } else {
    startProtractor();
  }
};

module.exports = exports['default'];