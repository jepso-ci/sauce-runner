var debug = require('debug')('sauce-runner:run');
var allBrowsers = require('test-platforms');
var Q = require('q');
var runVersion = require('./run-version');

//sauce:
//  function (fn(user, key)) => promise;
//
//  Calls fn with a sauce labs user and key and guarantees that there will be at least one slot to
//  run tests for that user and key until fn completes.
//
//  returns a promise for the result of fn
//
//config:
//  {browser: string, url: string, name: string[, tags: array][, continueOnFail: boolean][, versions: array][, skip: array]}
//
//  If continueOnFail is `true` then it will continue to run for version numbers lower than a given failed version.
//
//  If present, versions not in the `versions` array will be skipped.
//  If present, versions in the `skip` array will be skipped.
//
//  Skipped versions are automatically failed with a report type of `'skipped'` and the
//  next version is run (i.e. as if continueOnFail were true).
//
//output:
//  {startVersion: function (version) => promise, endVersion: function (version, result) => promise}
//
//  `result` is of the form:
//    { sauceUser: string, sauceKey: string, sauceTestID: string, passed: bool, report: object}
//
//  Both functions may optionaly return a promise which will be waited on before continuing.
//
//returns promise

module.exports = run;
function run(sauce, config, output) {
  config = Object.create(config);
  var versions = unique(allBrowsers[config.browser].map(function (b) { return b.version; }));

  debug('testing %j', versions);

  var def = Q.defer();

  function next(i) {
    if (i === versions.length) return def.resolve(null);
    Q(output.startVersion(versions[i]))
      .then(function () {

        if ((config.skip     && config.skip.indexOf(versions[i])     !=  -1) ||
            (config.versions && config.versions.indexOf(versions[i]) === -1)){
          return Q(output.endVersion(versions[i], {passed: false, report: {type: 'skipped'}}))
            .then(function () { next(i + 1); });
        }

        debug('testing %j', versions[i]);
        config.version = versions[i];
        return sauce(function (user, key) {
            config.sauce = {user: user, key: key};
            return runVersion(config)
          })
          .then(function (result) {
            if (result.sauceTestID) return Q(result).delay(60000);//allow time for test to be closed on server
            else return result;
          })
          .then(function (result) {
            return Q(output.endVersion(versions[i], result)).thenResolve(result);
          })
          .then(function (result) {
            if (result.passed === false && !config.continueOnFail) return def.resolve(null);
            next(i + 1);
          });
      })
      .done(null, function (err) { def.reject(err); });
  }
  next(0);

  return def.promise;
}

function unique(array) {
  var seen = {};
  return array.filter(function (item) {
    if (seen['_key_' + item]) return false;
    seen['_key_' + item] = true;
    return true;
  });
}