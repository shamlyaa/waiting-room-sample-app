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

  const precallResult = `
          <div class="alert ${classResult} alert-dismissible fade show" role="alert">
          Connectivity successful : ${results.success}
          <div id="message"></div>
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>`;
  document
    .getElementById('publisher')
    .insertAdjacentHTML('beforeend', precallResult);
  document.getElementById('message').innerHTML =
    '<ul>' +
    message
      .map(function(error) {
        return '<li>' + error + '</li>';
      })
      .join('');
  +'</ul>';
  //   document.getElementById('progress').style.display = 'none';
};
