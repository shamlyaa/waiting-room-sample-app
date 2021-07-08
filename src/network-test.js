import NetworkTest, { ErrorNames } from 'opentok-network-test-js';
import { handleTestProgressIndicator } from './test-progress';
import { addConnectivityTestResults } from './connectivity-test-results';
import { addQualityTestResults } from './quality-test-results';

export const startTest = ({ apiKey, sessionId, token }) => {
  const otNetworkTest = new NetworkTest(
    OT,
    {
      apiKey: apiKey, // Add the API key for your OpenTok project here.
      sessionId: sessionId, // Add a test session ID for that project
      token: token
    },
    {
      timeout: 30000
    }
  );

  return new Promise((resolve, reject) => {
    otNetworkTest
      .testConnectivity()
      .then(results => {
        console.log('OpenTok connectivity test results', results);
        addConnectivityTestResults(results);
        handleTestProgressIndicator();
        otNetworkTest
          .testQuality(function updateCallback(stats) {
            console.log('intermediate testQuality stats', stats);
          })
          .then(results => {
            resolve(results);
            // This function is called when the quality test is completed.
            console.log('OpenTok quality results', results);
            let publisherSettings = {};
            if (results.video.reason) {
              console.log('Video not supported:', results.video.reason);
              publisherSettings.videoSource = null; // audio-only
            } else {
              publisherSettings.frameRate = results.video.recommendedFrameRate;
              publisherSettings.resolution =
                results.video.recommendedResolution;
            }
            if (!results.audio.supported) {
              console.log('Audio not supported:', results.audio.reason);
              // video-only, but you probably don't want this -- notify the user?
            }
            if (
              !publisherSettings.videoSource &&
              !publisherSettings.audioSource
            ) {
              // Do not publish. Notify the user.
            } else {
              // Publish to the "real" session, using the publisherSettings object.
            }
          })
          .catch(error => {
            console.log('OpenTok quality test error', error);
          });
      })
      .catch(error => {
        console.log('OpenTok connectivity test error', error);
      });
  });
};
