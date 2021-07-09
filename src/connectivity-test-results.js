import { ErrorNames } from 'opentok-network-test-js';
export const addConnectivityTestResults = results => {
  const classResult = results.success ? 'alert-success' : 'alert-warning';
  let message = [];
  console.log(ErrorNames);

  if (results.failedTests) {
    results.failedTests.forEach(failedTest => {
      console.log(failedTest.error.name);
      message.push(failedTest.error.message);
    });
  }

  const addErrorList = message => {
    message
      .map(function(error) {
        return '<li>' + error + '</li>';
      })
      .join('');
  };

  const messageToShow = results.success
    ? 'You can connect to our servers. We are checking expected quality...'
    : 'You can not connect to our servers';

  const precallResult = `
          <div class="alert ${classResult} alert-dismissible fade show alert-centered" role="alert">
          <div>${messageToShow}</div>
          <div id="message"></div>
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>`;
  document
    .getElementById('banner')
    .insertAdjacentHTML('beforeend', precallResult);
  document.getElementById('message').innerHTML =
    '<ul>' +
    message
      .map(error => {
        return '<li>' + error + '</li>';
      })
      .join('');
  +'</ul>';
  //   document.getElementById('progress').style.display = 'none';
};
