(function () {
  if (typeof window.testsPassed === 'boolean') {
    return {f: true, p: window.testsPassed, r: window.testsReport};
  } else {
    return {f: false, c: window.completedTests};
  }
}());