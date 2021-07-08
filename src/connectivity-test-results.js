import { ErrorNames } from 'opentok-network-test-js';
export const addConnectivityTestResults = results => {
  const classResult = results.success ? 'alert-success' : 'alert-warning';
  let message = null;

  results.failedTests &&
    results.failedTests.forEach(failedTest => {
      switch (failedTest.error.name) {
        case ErrorNames.API_CONNECTIVITY_ERROR:
        case ErrorNames.CONNECT_TO_SESSION_NETWORK_ERROR:
        case ErrorNames.LOGGING_SERVER_CONNECTION_ERROR:
          message = 'Check your internet connection or firewall';
        case ErrorNames.FAILED_TO_OBTAIN_MEDIA_DEVICES:
          message =
            'You need to gran media devices access (camera and microphone)';

        case ErrorNames.NO_AUDIO_CAPTURE_DEVICES:
          message = 'The browser cannot access a microphone.';

        case ErrorNames.NO_VIDEO_CAPTURE_DEVICES:
          message = 'The browser cannot access a camera';
        default:
          console.error('Unknown error .');
      }
    });

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
