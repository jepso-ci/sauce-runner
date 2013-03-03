require('mocha-as-promised')();
var Q = require('q');
var assert = require('better-assert');
var throttle = require('throat')(2);

var sauce = {
  user: 'sauce-runner',
  key: 'c71a5c75-7c28-483f-9053-56da13b40bc2'
};

function runVersion(config) {
  return throttle(function () {
    return require('../').runVersion(config);
  })
}
var ie6 = runVersion({
  browser: 'internet explorer',
  version: '6',
  url: 'https://jepso-ci.com/api/proxy/jepso-ci-examples/minimum/master/test.html',
  name: 'mimimun on ie6 fails',
  sauce: sauce
});
var chrome = runVersion({
  browser: 'chrome',
  version: null,
  url: 'https://jepso-ci.com/api/proxy/jepso-ci-examples/minimum/master/test.html',
  name: 'mimimun on chrome passes',
  sauce: sauce
});
var ie8 = runVersion({
  browser: 'internet explorer',
  version: '8',
  url: 'https://jepso-ci.com/api/proxy/jepso-ci-examples/minimum/master/test.html',
  name: 'mimimun on ie8 passes',
  sauce: sauce
});
var timeout = runVersion({
  browser: 'chrome',
  version: null,
  url: 'https://jepso-ci.com/api/proxy/jepso-ci-examples/timeout/master/test.html',
  name: 'timeout on chrome fails',
  sauce: sauce
});
var nonExistant = runVersion({
  browser: 'chrome',
  version: null,
  url: 'https://jepso-ci.com/api/non-existant/test.html',
  name: 'timeout on chrome fails',
  sauce: sauce
});

describe('runVersion', function () {
  describe('minimum', function () {
    describe('on internet explorer 6', function () {
      it('fails', function () {
        return ie6
          .then(function (res) {
            assert(res.passed === false);
            assert(res.report && typeof res.report === 'object');
            assert(res.report.type === 'html');
            assert(res.report.text && typeof res.report.text === 'string');
            assert(res.sauceUser);
            assert(res.sauceUser === sauce.user);
            assert(res.sauceKey);
            assert(res.sauceKey === sauce.key);
            assert(res.sauceTestID);
          });
      });
    });
    describe('on internet explorer 8', function () {
      it('passes', function () {
        return ie8
          .then(function (res) {
            assert(res.passed === true);
            assert(res.report && typeof res.report === 'object');
            assert(res.report.type === 'html');
            assert(res.report.text && typeof res.report.text === 'string');
            assert(res.sauceUser);
            assert(res.sauceUser === sauce.user);
            assert(res.sauceKey);
            assert(res.sauceKey === sauce.key);
            assert(res.sauceTestID);
          });
      });
    });
    describe('on chrome', function () {
      it('passes', function () {
        return chrome
          .then(function (res) {
            assert(res.passed === true);
            assert(res.report && typeof res.report === 'object');
            assert(res.report.type === 'html');
            assert(res.report.text && typeof res.report.text === 'string');
            assert(res.sauceUser);
            assert(res.sauceUser === sauce.user);
            assert(res.sauceKey);
            assert(res.sauceKey === sauce.key);
            assert(res.sauceTestID);
          });
      });
    });
  });

  describe('timeout', function () {
    describe('on chrome', function () {
      it('fails', function () {
        return timeout
          .then(function (res) {
            assert(res.passed === false);
            assert(res.report && typeof res.report === 'object');
            assert(res.report.type === 'timeout');
            assert(res.sauceUser);
            assert(res.sauceUser === sauce.user);
            assert(res.sauceKey);
            assert(res.sauceKey === sauce.key);
            assert(res.sauceTestID);
          });
      });
    });
  });

  describe('404', function () {
    describe('on chrome', function () {
      it('fails', function () {
        return nonExistant
          .then(function (res) {
            //Note, no sauce property
            assert(res.passed === false);
            assert(res.report && typeof res.report === 'object');
            assert(res.report.type === 'status-code');
            assert(res.report.statusCode === 404);
          });
      });
    });
  });
});