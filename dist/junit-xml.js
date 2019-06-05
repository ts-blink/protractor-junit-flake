'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.processResults = processResults;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _xml2js = require('xml2js');

function processResults(filePattern) {
  var cwd = process.cwd();
  var files = _glob2['default'].sync(filePattern, { cwd: cwd });
  return files.reduce(function (specNames, file) {
    var resolvedPath = _path2['default'].resolve(cwd, file);
    console.log('\nReading file ', resolvedPath, '\n');
    var fileContents = _fs2['default'].readFileSync(resolvedPath);
    try {
      (0, _xml2js.parseString)(fileContents, function (err, result) {
        if (err) {
          console.log('Found parsing errors: ', err, '\n');
          return;
        }
        var suites = _lodash2['default'].castArray(result.testsuites.testsuite);
        suites.forEach(function (suite) {
          if (!suite.testcase) {
            return;
          }
          var cases = (0, _lodash2['default'])(suite.testcase).castArray().partition(function (caze) {
            return !!caze.failure;
          }).value();

          suite.testcase = cases[1];
          var cazeNames = cases[0].map(function (caze) {
            return caze.$.name;
          });
          if (cazeNames) {
            specNames.push.apply(specNames, _toConsumableArray(cazeNames));
          }
        });
        var builder = new _xml2js.Builder();
        var xml = builder.buildObject(result);
        _fs2['default'].writeFileSync(resolvedPath, xml);
      });
      return specNames;
    } catch (err) {
      console.log('Errors parsing xml: ', err, '\n');
      return specNames;
    }
  }, []);
}