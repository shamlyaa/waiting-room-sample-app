import NetworkTest, { ErrorNames } from 'opentok-network-test-js';

export const startTest = () => {
  const otNetworkTest = new NetworkTest(OT, {
    apiKey: '46264952', // Add the API key for your OpenTok project here.
    sessionId:
      '2_MX40NjI2NDk1Mn5-MTYyNTY1NjM5MzUxMn4ycTZWa0dJRzB3R3BRYW1JU1VER0JWcHh-fg', // Add a test session ID for that project
    token:
      'T1==cGFydG5lcl9pZD00NjI2NDk1MiZzaWc9NTVmZjU0YzgwYWVlM2QwMDJlM2U0ZjRmZThhOGUzYWVkNmMxNTQzNDpzZXNzaW9uX2lkPTJfTVg0ME5qSTJORGsxTW41LU1UWXlOVFkxTmpNNU16VXhNbjR5Y1RaV2EwZEpSekIzUjNCUllXMUpVMVZFUjBKV2NIaC1mZyZjcmVhdGVfdGltZT0xNjI1NjU2NDA3Jm5vbmNlPTAuNDg3MDc1MzkzNTg0Njg5OSZyb2xlPXB1Ymxpc2hlciZleHBpcmVfdGltZT0xNjI2MjYxMjA2JmluaXRpYWxfbGF5b3V0X2NsYXNzX2xpc3Q9' // Add a token for that session here
  });

  return new Promise((resolve, reject) => {
    otNetworkTest
      .testConnectivity()
      .then(results => {
        console.log('OpenTok connectivity test results', results);
        otNetworkTest
          .testQuality(function updateCallback(stats) {
            console.log('intermediate testQuality stats', stats);
          })
          .then(results => {
            resolve(results);
            // this.precallTestDone = true;
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
              publisherSettings.audioSource = null;
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
