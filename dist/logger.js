'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var LOG_LEVELS = {
  debug: 1,
  protractor: 2,
  info: 3,
  silent: 4
};

var Logger = (function () {
  function Logger(color) {
    _classCallCheck(this, Logger);

    this.color = color;
  }

  _createClass(Logger, [{
    key: 'log',
    value: function log(levelName, message) {
      var useColor = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

      var currentLevel = LOG_LEVELS[process.env.PROTRACTOR_FLAKE_LOG_LEVEL] || LOG_LEVELS.protractor;
      var incomingLevel = LOG_LEVELS[levelName];

      if (incomingLevel >= currentLevel) {
        message = this.colorize(message, useColor);
        process.stdout.write(message);
      }
    }
  }, {
    key: 'protractor',
    value: function protractor(message) {
      this.log('protractor', message, false);
    }
  }, {
    key: 'colorize',
    value: function colorize(message, useColor) {
      if (useColor && _chalk2['default'].supportsColor && this.color) {
        return _chalk2['default'][this.color](message);
      } else {
        return message;
      }
    }
  }]);

  return Logger;
})();

exports['default'] = Logger;
module.exports = exports['default'];