import {
  // isHostPresent,
  refreshDeviceList,
  // usersConnected,
  // connectionCount,
  onVideoSourceChanged,
  onAudioSourceChanged
} from './utils';
// import { usersConnected, connectionCount } from './variables';
import variables from './variables';
let { usersConnected, connectionCount } = variables;
import { startTest } from './network-test';
import { getCredentials } from './credentials';

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
    this.isPublishing = false;
    this.roomToken = null;
  }
  init() {
    getCredentials(this.roomName, 'participant')
      .then(data => {
        this.roomToken = data.token;
        this.initializeSession(data);
        getCredentials(`${this.roomName}-precall`, 'participant').then(
          precallCreds => {
            startTest(precallCreds)
              .then(results => {
                console.log(results);
                this.precallTestDone = true;
                console.log(usersConnected);
                this.connect();
                // if (this.isHostPresent()) this.handlePublisher();
              })
              .catch(e => console.log(e));
          }
        );

        this.registerEvents();
      })
      .catch(e => console.log(e));
  }

  isHostPresent() {
    if (usersConnected.find(e => e.data === 'admin')) {
      return true;
    } else {
      return false;
    }
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

  handleError(error) {
    if (error) {
      console.error(error);
    }
  }

  initializeSession({ apiKey, sessionId }) {
    this.session = OT.initSession(apiKey, sessionId);

    this.session.on('connectionCreated', event => {
      connectionCount += 1;
      console.log('[connectionCreated]', connectionCount);
      usersConnected.push(event.connection);
      console.log(usersConnected);

      if (
        (this.isHostPresent() || event.connection.data === 'admin') &&
        event.connection.connectionId === this.session.connection.connectionId
      ) {
        // if (this.precallTestDone) {
        this.handlePublisher();
        // }
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
      console.log('stream created in the session');

      this.handleSubscriber(event.stream);
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
        this.isPublishing = true;
      },
      streamDestroyed: e => {
        this.isPublishing = false;
      }
    });
  }

  handlePublisher() {
    console.log('[handlePublish]');
    if (!this.isPublishing && connectionCount > 1) {
      this.session.publish(this.waitingRoompublisher, this.handleError);
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

  toggleAudio() {
    this.hasAudio = !this.hasAudio;
    if (!this.hasAudio) {
      document.getElementById('micIcon').src = './icons/mic-mute-fill.svg';
    } else {
      document.getElementById('micIcon').src = './icons/mic-fill.svg';
    }
    this.waitingRoompublisher.publishAudio(this.hasAudio);
  }

  // async handleTest() {
  //   try {
  //     const result = await this.startTest();
  //     this.precallTestDone = true;
  //     console.log('host ' + t);
  //     if (this.isHostPresent()) this.handlePublisher();
  //     return result;
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }

  connect() {
    this.session.connect(this.roomToken, error => {
      if (error) {
        handleError(error);
      } else {
        console.log('Session Connected');
      }
    });
  }

  // addTestResults(result) {
  //   const classResult =
  //     result.text === `You're all set!` ? 'alert-success' : 'alert-warning';
  //   const precallResult = `
  //         <div class="alert ${classResult} alert-dismissible fade show" role="alert">
  //         ${result.text}
  //         <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  //         </div>`;
  //   document
  //     .getElementById('publisher')
  //     .insertAdjacentHTML('beforeend', precallResult);
  //   document.getElementById('progress').style.display = 'none';
  // }

  // handleTestProgressIndicator() {
  //   const progressIndicator = setInterval(() => {
  //     let currentProgress = document.getElementById('progress').value;
  //     document.getElementById('progress').value += 5;
  //     if (currentProgress === 100) {
  //       clearInterval(progressIndicator);
  //       document.getElementById('progress').value = 0;
  //     }
  //   }, 1000);
  // }
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
