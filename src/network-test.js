import NetworkTest from 'opentok-network-test-js';
import {
  handleTestProgressIndicator,
  removeProgressIndicator
} from './test-progress';
import { addConnectivityTestResults } from './connectivity-test-results';
import { addQualityTestResults } from './quality-test-results';
import { displayQualityError } from './quality-test-error';

export const startTest = ({ apiKey, sessionId, token }) => {
  const otNetworkTest = new NetworkTest(OT, {
    apiKey: apiKey,
    sessionId: sessionId,
    token: token
  });

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
            addQualityTestResults(results);
            removeProgressIndicator();
            resolve(results);
            // This function is called when the quality test is completed.
            console.log('OpenTok quality results', results);
          })
          .catch(error => {
            displayQualityError(error);
            console.log('OpenTok quality test error', error);
          });
      })
      .catch(error => {
        console.log('OpenTok connectivity test error', error);
      });
  });
};
