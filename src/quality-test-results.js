import { ErrorNames } from 'opentok-network-test-js';
export const addQualityTestResults = results => {
  const classResult = results.success ? 'alert-success' : 'alert-warning';
  let message = null;

  results.failedTests &&
    results.failedTests.forEach(failedTest => {
      switch (failedTest.error.name) {
        case ErrorNames.API_CONNECTIVITY_ERROR:
          message = 'You can not connect to our API servers';
          break;
        case ErrorNames.CONNECT_TO_SESSION_NETWORK_ERROR:
          message = 'Check your network connection';
          break;
        case ErrorNames.LOGGING_SERVER_CONNECTION_ERROR:
          message = 'Can not connect to our Logging server';
          break;
        case ErrorNames.FAILED_TO_OBTAIN_MEDIA_DEVICES:
          message =
            'You need to gran media devices access (camera and microphone)';
          break;
        case ErrorNames.NO_AUDIO_CAPTURE_DEVICES:
          message = 'The browser cannot access a microphone.';
          break;
        case ErrorNames.NO_VIDEO_CAPTURE_DEVICES:
          message = 'The browser cannot access a mierda';
          break;
        default:
          console.error('Unknown error .');
      }
    });
  console.log(message);

  const precallResult = `
          <div class="alert ${classResult} alert-dismissible fade show" role="alert">
          Connectivity successful : ${results.success}
          <div>${message}</div>
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>`;
  document
    .getElementById('publisher')
    .insertAdjacentHTML('beforeend', precallResult);
  //   document.getElementById('progress').style.display = 'none';
};
