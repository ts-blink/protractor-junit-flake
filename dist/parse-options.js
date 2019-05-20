'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _path = require('path');

var DEFAULT_OPTIONS = {
  nodeBin: 'node',
  maxAttempts: 3,
  protractorArgs: [],
  // set color to one of the colors available at 'chalk' - https://github.com/chalk/ansi-styles#colors
  // set false to disable coloring
  color: 'magenta',
  resultsXmlPath: (0, _path.join)(process.cwd(), '/results/*.xml')
};

function parseOptions(providedOptions) {
  var options = Object.assign({}, DEFAULT_OPTIONS, providedOptions);

  // normalizing options.color to be a boolean or a color value
  if (!(options.color in _chalk2['default'])) {
    if (options.color === false || options.color === 'false') {
      options.color = false;
    } else {
      throw new Error('Invalid color option. Color must be one of the supported chalk colors: https://github.com/chalk/ansi-styles#colors');
    }
  }

  if (options.protractorPath) {
    options.protractorPath = (0, _path.resolve)(options.protractorPath);
  } else {
    // '.../node_modules/protractor/lib/protractor.js'
    var protractorMainPath = require.resolve('protractor');
    // '.../node_modules/protractor/bin/protractor'
    options.protractorPath = (0, _path.resolve)(protractorMainPath, '../../bin/protractor');
  }

  return options;
}

exports['default'] = parseOptions;
module.exports = exports['default'];