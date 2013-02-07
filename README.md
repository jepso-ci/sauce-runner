# sauce-runner

Run tests for a given all versions of a browser

## Example

Set the environment variables SAUCE_USER and SAUCE_KEY.

```javascript
var test = require('sauce-runner');
//or if you didn't set the sauce user & key
//var test = require('sauce-runner').user('user', 'key');

test('internet explorer',
     'http://mocha-ci.com/api/proxy/jepso-ci-examples/minimum/master/test.html', 
     'sample test', [], 
     function (b) { console.log('testing ' + b); })
  .done(function (v) { console.log(v); });

// => testing internet explorer version 10 running on Windows 2012
// => testing internet explorer version 9 running on Windows 2008
// => testing internet explorer version 8 running on Windows 2003
// => testing internet explorer version 7 running on Windows 2003
// => { passed: false, sessionID: 'dfasjfkasjsa', report: null, failedVersion: '7', passedVersion: '8' }
```