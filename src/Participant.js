import {
  isHostPresent,
  refreshDeviceList,
  usersConnected,
  connectionCount,
  onVideoSourceChanged,
  onAudioSourceChanged
} from './utils';

import NetworkTest, { ErrorNames } from 'opentok-network-test-js';

export class Participant {
  constructor(roomName) {
    this.roomName = roomName;
    this.basicUrl = 'http://localhost:3000';
    this.roomName = roomName;
    this.session = null;
    this.waitingRoompublisher = null;
    this.precallTestDone = false;
    this.hasVideo = true;
    this.hasAudio = true;
  }
  init() {
    this.getCredentials().then(data => {
      this.initializeSession(data);
      this.startTest();
      this.registerEvents();
    });
  }

  registerEvents() {
    document.getElementById('cameraButton').addEventListener('click', () => {
      this.toggleVideo();
    });
    document.getElementById('micButton').addEventListener('click', () => {
      this.toggleAudio();
    });
    document.getElementById('videoInputs').addEventListener('change', e => {
      onVideoSourceChanged(e, this.waitingRoompublisher);
    });

    document.getElementById('audioInputs').addEventListener('change', e => {
      onAudioSourceChanged(e, this.waitingRoompublisher);
    });
  }

  async getCredentials() {
    // Default
    try {
      const url = `/api/room/${this.roomName}?role=participant`;
      const config = {};
      const response = await fetch(`${this.basicUrl}${url}`, config);
      const data = await response.json();
      console.log(data);
      if (data.apiKey && data.sessionId && data.token) {
        // roomApiKey = data.apiKey;
        // roomSessionId = data.sessionId;
        // roomToken = data.token;
        return Promise.resolve(data);
      }
      return Promise.reject(new Error('Credentials Not Valid'));
    } catch (error) {
      console.log(error.message);
      return Promise.reject(error);
    }
  }

  initControls() {}

  handleError(error) {
    if (error) {
      console.error(error);
    }
  }

  async waitForTestToSubscribe(stream) {
    if (this.precallTestDone) {
      this.handleSubscriber(stream);
    } else {
      await this.sleep(3000);
      this.waitForTestToSubscribe(stream);
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  initializeSession(data) {
    const { apiKey, sessionId, token } = data;
    this.session = OT.initSession(apiKey, sessionId);

    this.session.on('connectionCreated', event => {
      connectionCount += 1;
      console.log('[connectionCreated]', connectionCount);
      usersConnected.push(event.connection);
      console.log(usersConnected);

      if (isHostPresent() || event.connection.data === 'admin') {
        if (this.precallTestDone) {
          this.handlePublisher();
        }
      }
    });

    this.session.on('connectionDestroyed', event => {
      connectionCount -= 1;
      console.log('[connectionDestroyed]', connectionCount);
      usersConnected = usersConnected.filter(connection => {
        return connection.id != event.connection.id;
      });
      connectionCount -= 1;
      console.log(usersConnected);
    });

    this.session.on('streamCreated', event => {
      if (!this.precallTestDone) {
        this.waitForTestToSubscribe(event.stream);
      } else {
        this.handleSubscriber(event.stream);
      }
    });

    // initialize the publisher

    this.waitingRoompublisher = OT.initPublisher(
      'publisher',
      {
        insertMode: 'append',
        width: '100%',
        height: '100%'
      },
      this.handleError
    );

    this.waitingRoompublisher.on({
      accessAllowed: event => {
        console.log('accessAllowed');
        refreshDeviceList(this.waitingRoompublisher);
      },
      accessDenied: () => {
        alert('Please grant devices access');
        // The user has denied access to the camera and mic.
      },
      audioLevelUpdated: event => {
        this.calculateAudioLevel(event.audioLevel);
      },
      streamCreated: e => {
        console.log('the participant started streaming');
        isPublishing = true;
      },
      streamDestroyed: e => {
        isPublishing = false;
      }
    });

    // Connect to the session
    this.session.connect(token, error => {
      if (error) {
        handleError(error);
      } else {
        console.log('Session Connected');
      }
    });
  }

  handlePublisher() {
    console.log('[handlePublish]');
    if (!isPublishing && connectionCount > 1) {
      this.session.publish(waitingRoompublisher, this.handleError);
    }
  }

  handleSubscriber(stream) {
    const subscriberOptions = {
      insertMode: 'append',
      width: '100%',
      height: '100%'
    };
    this.session.subscribe(
      stream,
      'subscriber',
      subscriberOptions,
      this.handleError
    );
  }

  calculateAudioLevel(audioLevel) {
    let movingAvg = null;
    if (movingAvg === null || movingAvg <= audioLevel) {
      movingAvg = audioLevel;
    } else {
      movingAvg = 0.8 * movingAvg + 0.2 * audioLevel;
    }
    // console.log(movingAvg);
    // 1.5 scaling to map the -30 - 0 dBm range to [0,1]
    const currentLogLevel = Math.log(movingAvg) / Math.LN10 / 1.5 + 1;
    this.setLogLevel(Math.min(Math.max(currentLogLevel, 0), 1) * 100);
    // console.log(Math.min(Math.max(currentLogLevel, 0), 1) * 100);
  }

  setLogLevel(logLevel) {
    document.getElementById('audioMeter').value = logLevel;
  }

  toggleVideo() {
    this.hasVideo = !this.hasVideo;
    if (!this.hasVideo) {
      document.getElementById('cameraIcon').src =
        './icons/camera-video-off-fill.svg';
    } else {
      document.getElementById('cameraIcon').src =
        './icons/camera-video-fill.svg';
    }
    this.waitingRoompublisher.publishVideo(this.hasVideo);
  }

  startTest() {
    const otNetworkTest = new NetworkTest(OT, {
      apiKey: '46264952', // Add the API key for your OpenTok project here.
      sessionId:
        '2_MX40NjI2NDk1Mn5-MTYyNTY1NjM5MzUxMn4ycTZWa0dJRzB3R3BRYW1JU1VER0JWcHh-fg', // Add a test session ID for that project
      token:
        'T1==cGFydG5lcl9pZD00NjI2NDk1MiZzaWc9NTVmZjU0YzgwYWVlM2QwMDJlM2U0ZjRmZThhOGUzYWVkNmMxNTQzNDpzZXNzaW9uX2lkPTJfTVg0ME5qSTJORGsxTW41LU1UWXlOVFkxTmpNNU16VXhNbjR5Y1RaV2EwZEpSekIzUjNCUllXMUpVMVZFUjBKV2NIaC1mZyZjcmVhdGVfdGltZT0xNjI1NjU2NDA3Jm5vbmNlPTAuNDg3MDc1MzkzNTg0Njg5OSZyb2xlPXB1Ymxpc2hlciZleHBpcmVfdGltZT0xNjI2MjYxMjA2JmluaXRpYWxfbGF5b3V0X2NsYXNzX2xpc3Q9' // Add a token for that session here
    });

    otNetworkTest
      .testConnectivity()
      .then(results => {
        console.log('OpenTok connectivity test results', results);
        otNetworkTest
          .testQuality(function updateCallback(stats) {
            console.log('intermediate testQuality stats', stats);
          })
          .then(results => {
            this.precallTestDone = true;
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
  }

  toggleAudio() {
    this.hasAudio = !this.hasAudio;
    if (!this.hasAudio) {
      document.getElementById('micIcon').src = './icons/mic-mute-fill.svg';
    } else {
      document.getElementById('micIcon').src = './icons/mic-fill.svg';
    }
    this.waitingRoompublisher.publishAudio(this.hasAudio);
  }

  async handleTest() {
    try {
      const result = await this.startTest();
      this.precallTestDone = true;
      if (this.isHostPresent()) this.handlePublisher();
      return result;
    } catch (e) {
      console.log(e);
    }
  }

  addTestResults(result) {
    const classResult =
      result.text === `You're all set!` ? 'alert-success' : 'alert-warning';
    const precallResult = `
          <div class="alert ${classResult} alert-dismissible fade show" role="alert">
          ${result.text}
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>`;
    document
      .getElementById('publisher')
      .insertAdjacentHTML('beforeend', precallResult);
    document.getElementById('progress').style.display = 'none';
  }

  handleTestProgressIndicator() {
    const progressIndicator = setInterval(() => {
      let currentProgress = document.getElementById('progress').value;
      document.getElementById('progress').value += 5;
      if (currentProgress === 100) {
        clearInterval(progressIndicator);
        document.getElementById('progress').value = 0;
      }
    }, 1000);
  }
}

// const basicUrl = 'http://localhost:3000';
// const cameraButton = document.getElementById('cameraButton');
// const micButton = document.getElementById('micButton');
// const publisherOptions = {
//   insertMode: 'append',
//   width: '100%',
//   height: '100%'
// };
// let session = null;
// let waitingRoompublisher = null;
// let hasVideo = true;
// let hasAudio = true;
// let isPublishing = false;
// let precallTestDone = false;

// cameraButton.addEventListener('click', () => {
//   toggleVideo();
// });

// document.getElementById('videoInputs').addEventListener('change', e => {
//   onVideoSourceChanged(e, waitingRoompublisher);
// });
// navigator.mediaDevices.ondevicechange = () => {
//   console.log('Media Devices change detected, refreshing list');
//   refreshDeviceList();
// };

// micButton.addEventListener('click', () => {
//   toggleAudio();
// });

// document.getElementById('audioInputs').addEventListener('change', e => {
//   e.preventDefault();

//   onAudioSourceChanged(e, waitingRoompublisher);
// });

// handleTestProgressIndicator();
// handleTest().then(result => {
//   addTestResults(result);
// });
