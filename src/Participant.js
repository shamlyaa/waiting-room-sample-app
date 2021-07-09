import {
  refreshDeviceList,
  onVideoSourceChanged,
  onAudioSourceChanged,
  isHostPresent
} from './utils';
import variables from './variables';
let { usersConnected, connectionCount } = variables;
import { startTest } from './network-test';
import { getCredentials } from './credentials';

export class Participant {
  constructor(roomName) {
    this.roomName = roomName;
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
      console.log(isHostPresent() + ' is the host presence');
      if (event.connection.data === 'admin') {
        this.handlePublisher();
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
    console.log(this.isPublishing, connectionCount);
    if (!this.isPublishing) {
      this.session.publish(this.waitingRoompublisher, this.handleError);
    } else return;
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

  connect() {
    this.session.connect(this.roomToken, error => {
      if (error) {
        handleError(error);
      } else {
        if (isHostPresent()) {
          this.handlePublisher();
        }
        console.log('Session Connected');
      }
    });
  }
}
