var Q = require('q');
var assert = require('better-assert');
var run = require('../').user('sauce-runner', 'c71a5c75-7c28-483f-9053-56da13b40bc2');
var throttle = require('throat')(3);

var skip = false;
var path = [{desc:[], it:[]}];
function nDescribe(name, fn, skip) {
  var spec = {
    name: name,
    desc: [],
    it: [],
    skip: skip
  };
  path[path.length - 1].desc.push(spec);
  path.push(spec);
  fn();
  path.pop();
}
nDescribe.skip = function (name, fn) {
  skip = true;
  nDescribe(name, fn, true);
  skip = false;
};
function nIt(name, fn) {
  var prom = skip ? Q.resolve(null) : throttle(function () { return Q.resolve(null).then(fn) });
  path[path.length - 1].it.push({
    name: name,
    fn: function (done) {
      prom.done(function () { done(); });
    }
  });
}
nIt.skip = it.skip.bind(it);

(function (describe, it) {
  describe('minimum', function () {
    describe('on ie', function () {
      it('fails', function () {
        return run('internet explorer', 'http://mocha-ci.com/api/proxy/jepso-ci-examples/minimum/master/test.html', 
          'mimimun on ie fails', [], function () {})
          .then(function (res) {
            assert(res.passed === false);
            assert(res.report === null);
            assert(res.failedVersion === '7');
            assert(res.passedVersion === '8');
          });
      });
    });
    describe('on chrome', function () {
      it('passes', function () {
        return run('chrome', 'http://mocha-ci.com/api/proxy/jepso-ci-examples/minimum/master/test.html', 
          'mimimun on chrome passes', [], function () {})
          .then(function (res) {
            assert(res.passed === true);
            assert(res.report === null);
          });
      });
    });
  });

  describe('timeout', function () {
    describe('on chrome', function () {
      it('fails', function () {
        return run('chrome', 'http://mocha-ci.com/api/proxy/jepso-ci-examples/timeout/master/test.html',
          'timeout on chrome fails', [], function () {})
          .then(function (res) {
            assert(res.passed === false);
            assert(res.report && typeof res.report === 'object');
            assert(res.report.type === 'OperationTimeout');
            assert(res.failedVersion === null);
            assert(res.passedVersion === undefined);
          });
      });
    });
  });

  describe('404', function () {
    describe('on chrome', function () {
      it('fails', function () {
        return run('chrome', 'http://mocha-ci.com/api/non-existant/test.html',
          '404 on chrome fails', [], function () {})
          .then(function (res) {
            assert(res.passed === false);
            assert(res.report && typeof res.report === 'object');
            assert(res.report.type === 'OperationTimeout');//this could be changed as it's not ideal now
            assert(res.failedVersion === null);
            assert(res.passedVersion === undefined);
          });
      });
    });
  });
}(nDescribe, nIt));

function execute(desc) {
  for (var i = 0; i < desc.it.length; i++) {
    it(desc.it[i].name, desc.it[i].fn);
  }
  for (var i = 0; i < desc.desc.length; i++) {
    if (desc.desc[i].skip) {
      describe.skip(desc.desc[i].name, function () {
        execute(desc.desc[i]);
      });
    } else {
      describe(desc.desc[i].name, function () {
        execute(desc.desc[i]);
      });
    }
  }
}
execute(path[0]);