(function () {
  if (typeof window.testsPassed === 'boolean') {
    return {f: true, p: window.testsPassed, r: window.testsReport || {type: 'html', text: document.getElementsByTagName('html')[0].innerHTML}};
  } else {
    return {f: false, c: window.completedTests};
  }
}());