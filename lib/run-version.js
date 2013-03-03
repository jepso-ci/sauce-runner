var debug = require('debug')('sauce-runner:run-version');
var Q = require('q');

var head = Q.nfbind(require('request').head);

var sauce = require('sauce-lab');
var allBrowsers = require('test-platforms');

var code = require('uglify-js').minify(require('path').join(__dirname, 'browser.js')).code;

//config:
//  {browser: string, version: string, url: string, name: string, tags: array, sauce: { user: string, key: string}}
//
//returns promise for:
//  { sauceUser: string, sauceKey: string, sauceTestID: string, passed: bool, report: object}


module.exports = run;
function run(config) {

  var browserName = config.browser;
  var version = config.version;

  var browsers = allBrowsers[browserName]
    .filter(function (browser) {
      return browser.version === version;
    });


  var url = config.url;
  var name = config.name;
  var tags = config.tags || [];

  var user = config.sauce.user;
  var key = config.sauce.key;


  if (browsers.length === 0) {
    return Q.reject(new Error('There are no browsers called ' + JSON.stringify(browserName) +
                              ' at version ' + JSON.stringify(version)));
  }

  var result = head(url)
    .spread(function (res) {
      if (res.statusCode === 200) return {passed: true};
      else return {passed: false, report: { type: 'status-code', statusCode: res.statusCode}};
    })
    .then(function (res) {
      if (res.passed === false) return res;
      var def = Q.defer();

      function next(i) {

        var browser = browsers[i];

        debug('running ' + browser);

        var config = {user: user, key: key, browser: browser, url: url, name: name, tags: tags};
        config.code = code;

        var start = null;
        var completedTests = -1;
        var warned = false;
        config.parse = function (res, id) {
          if (start == null) {
            start = new Date();
          } else if (!res.f) {
            if (completedTests != res.c && typeof res.c === 'number') {
              completedTests = res.c;
              start = new Date();
              warned = false;
            } else if (!res.f && start.getTime() + 1000 * 60 < Date.now()) {
              if (warned) {
                res = { f: true, p: false, r: { type: 'timeout' } };
              } else {
                warned = true;
              }
            }
          }
          debug('res %s: %j', browser, res);
          if (!res.f) return null;//not finished yet
          return {
            sauceUser: user,
            sauceKey: key,
            sauceTestID: id,
            passed: res.p,
            report: res.r || null
          };
        };
        return sauce(config)
          .then(function (result) {
            if (result.passed === false || i + 1 === browsers.length) return def.resolve(result);
            else return next(i + 1);
          })
          .done(null, def.reject);
      }

      next(0);

      return def.promise;
    })
    .then(function (result) {
      if (result.sauceTestID) return Q(result).delay(60000);//allow time for test to be closed on server
      else return result;
    });
  return result; //{passed, report, sauceTestID}
}