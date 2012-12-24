var debug = require('debug')('sauce-runner');
var Q = require('q');
var sauce = require('sauce-lab');
var browsers = require('test-platforms');

var path = require('path');
var uglify = require('uglify-js');
var code = uglify.minify(path.join(__dirname, 'browser.js')).code;
function user(user, key) {
  user = user || process.env.SAUCE_USER;
  key = key || process.env.SAUCE_KEY;
  return function test(browserName, url, name, tags, intermediateCB) {
    intermediateCB = intermediateCB || function () {};
    var versions = browsers[browserName];
    var first = {};
    var result = Q.resolve(first);
    browsers[browserName].forEach(function (browser) {
      debug('queueing ' + browser);
      result = result
        .then(function (res) {
          if (res === first || (res && res.passed === true)) {
            debug('running ' + browser);
            intermediateCB(browser);
            var config = {user: user, key: key, browser: browser, url: url, name: name, tags: tags};
            config.code = code;
            config.parse = function (res) {
              debug('res %s: %j', browser, res);
              if (!res.f) return null;//not finished yet
              return {passed: res.p, report: res.r, version: browser.version};
            };
            return sauce(config);
          } else {
            return res;
          }
        });
    });
    return result
      .then(function (res) {
        if (res.passed === true) {
          return {passed: true, report: res.report};
        } else {
          var failedVersion = res.version;
          var passedVersion;
          var stop = false;
          browsers[browserName]
            .forEach(function (browser) {
              if (!stop && browser.version !== failedVersion) {
                passedVersion = browser.version;
              } else {
                stop = true;
              }
            });
          return {
            passed: false,
            report: res.report,
            failedVersion: failedVersion,
            passedVersion: passedVersion
          };
        }
      });
  }
}

function noKey() {
  throw new Error('You must specify your sauce-labs user and key to run tests.')
}

exports = module.exports = (process.env.SAUCE_USER && process.env.SAUCE_KEY) ?
                           user(process.env.SAUCE_USER, process.env.SAUCE_KEY) : 
                           noKey;
exports.user = user;
