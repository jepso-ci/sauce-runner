# sauce-runner
[![Build Status](https://travis-ci.org/jepso-ci/sauce-runner.png?branch=master)](https://travis-ci.org/jepso-ci/sauce-runner)
[![Dependency Status](https://david-dm.org/jepso-ci/sauce-runner.png)](https://gemnasium.com/jepso-ci/sauce-runner)

Run tests for all versions of a given browser

## API

### run(sauce, config, output)

  Runs tests for all versions of a given browser and returns a promise that is resolved with undefined once all tests are completed.


#### sauce(fn(user, key))

  Sauce should be a function which, when called with a function `fn` calls `fn` with two arguments (the sauce labs user and key).  It returns a promise for the result of `fn`.  It is not necessarily required to call `fn` immediately.  It should wait until there is a slot available to run the tests.

#### config

The config argument should be an object with the following properites

 - `browser` - required - string - The name of the browser to run tests on, valid names are:
   - `opera`
   - `internet explorer`
   - `firefox`
   - `safari`
   - `chrome`
   - `ipad`
   - `iphone`
   - `android`
 - `url` - required - string - The url of the page containing tests, tests will be failed if this does not return a status code of `200`.
 - `name` - required - string - The name to give the tests in sauce labs (can be any non-empty string).
 - `tags` - optional - array(string) - An array of tags to use in sauce labs
 - `continueOnFail` - optional (default: `false`) - Set this to `true` to continue running tests on older versions of a browser, even if newer versions have failed the tests.
 - `versions` - optional - array(string) - An array of versions to test, if provided, only the versions in this array will be tested.  Those versions not in this array will be skipped.
 - `skip` - optional - array(string) - An array of versions to not test, if provided, versions in this array will be skipped.

#### output

The output argument should be an object with two properties:

 - `startVersion` - required - function
 - `endVersion` - required - function

`startVersion` is a function which takes the single argument `version` which is the version of the browser about to be tested, it may optionally return a promise, and tests won't begin until that promise resolves.

`endVersion` is a function which takes two arguments, `version` which is the version of the browser that has just been tested, and `result` which is described below.  It may optionally return a promise, and tests won't continue until that promise resolves.

`result` is an object of the form:

```javascript
{
  passed: true || false,
  report: {type: 'string', ...},
  sauceUser: 'sauceUser',
  sauceKey: 'sauceKey',
  sauceTestID: 'sauceTestID'
}
```

Note `sauceUser`, `sauceKey` and `sauceTestID` are not present in cases where the test was skipped, or where the url requested returned a status code other than `200`.  Those can be identified by having `report.type === 'skipped'` and `report.type === 'status-code'`.  If `passed === true` there will always be sauce info.

