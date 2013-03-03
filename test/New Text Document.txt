require('mocha-as-promised')();
var Q = require('q');
var assert = require('better-assert');
var run = require('../').run;

var sauce = {
  user: 'sauce-runner',
  key: 'c71a5c75-7c28-483f-9053-56da13b40bc2'
};

var start = {};
var end = {};

(function () {
  var startD = {};
  var endD = {};

  for (var i = 6; i <= 10; i++) {
    var d = Q.defer();
    startD[i] = d;
    start[i] = d.promise;
    d = Q.defer();
    endD[i] = d;
    end[i] = d.promise;
  }
  run(function (fn) {
      return fn(sauce.user, sauce.key);
    },
    {
      browser: 'internet explorer',
      url: 'https://jepso-ci.com/api/proxy/jepso-ci-examples/minimum/master/test.html',
      name: 'ie fails minimum at some point',
      skip: ['8'],
      versions: ['9', '8', '7'],
      continueOnFail: true
    }, {
      startVersion: function (version) { startD[version].resolve(null); },
      endVersion: function (version, result) { endD[version].resolve(result); }
    }).done(function () {
      //console.warn('\nALL TESTS RUN\n');
    });
}());

describe('run(sauce, {browser: "internet explorer", url: minimum, skip: ["8"], versions: ["9", "8", "7"], continueOnFailure: true}, out)', function () {
  describe('10', function () {
    it('is skipped', function () {
      return start['10'].thenResolve(end['10'])
        .then(function (res) {
            assert(res.passed === false);
            assert(res.report && typeof res.report === 'object');
            assert(res.report.type === 'skipped');
        });
    });
  });
  describe('9', function () {
    it('passes', function () {
      return start['9'].thenResolve(end['9'])
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
  describe('8', function () {
    it('is skipped', function () {
      return start['8'].thenResolve(end['8'])
        .then(function (res) {
            assert(res.passed === false);
            assert(res.report && typeof res.report === 'object');
            assert(res.report.type === 'skipped');
        });
    });
  });
  describe('7', function () {
    it('fails', function () {
      return start['7'].thenResolve(end['7'])
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
  describe('6', function () {
    it('is skipped', function () {
      return start['6'].thenResolve(end['6'])
        .then(function (res) {
            assert(res.passed === false);
            assert(res.report && typeof res.report === 'object');
            assert(res.report.type === 'skipped');
        });
    });
  });
});