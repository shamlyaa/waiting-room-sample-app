import {
  refreshDeviceList,
  // usersConnected,
  // connectionCount,
  onVideoSourceChanged,
  onAudioSourceChanged
} from './utils';

import variables from './variables';
let { usersConnected, connectionCount } = variables;
import { getCredentials } from './credentials';

export class Host {
  constructor(roomName) {
    this.basicUrl = 'http://localhost:3000';
    this.roomName = roomName;
    this.session = null;
    this.publisher = null;
    this.isPublishing = false;
    this.hasVideo = true;
    this.hasAudio = true;
  }
  async getCredentials() {
    try {
      const url = `/api/room/${this.roomName}?role=admin`;
      console.log(url, this.basicUrl);
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
    } catch (error) {
      console.log(error.message);
      return Promise.reject(error);
    }
  }

  handleError(error) {
    if (error) {
      console.error(error);
    }
  }
  registerEvents() {
    document.getElementById('cameraButton').addEventListener('click', () => {
      this.toggleVideo();
    });
    document.getElementById('micButton').addEventListener('click', () => {
      this.toggleAudio();
    });
    navigator.mediaDevices.ondevicechange = () => {
      refreshDeviceList(this.publisher);
    };

    document.getElementById('videoInputs').addEventListener('change', e => {
      onVideoSourceChanged(e, this.publisher);
    });

    document.getElementById('audioInputs').addEventListener('change', e => {
      onAudioSourceChanged(e, this.publisher);
    });
  }

  init() {
    getCredentials(this.roomName, 'admin').then(data => {
      // this.getCredentials().then(data => {
      this.initializeSession(data);
      this.registerEvents();
    });
  }

  initializeSession(data) {
    const { apiKey, sessionId, token } = data;
    this.session = OT.initSession(apiKey, sessionId);
    console.log(this);

    this.session.on('connectionCreated', function(event) {
      connectionCount += 1;
      usersConnected.push(event.connection);
      console.log(usersConnected);
      console.log('[connectionCreated]', connectionCount);
    });

    this.session.on('connectionDestroyed', function(event) {
      connectionCount -= 1;
      console.log('[connectionDestroyed]', connectionCount);
      console.log(event.connection);
      usersConnected = usersConnected.filter(connection => {
        return connection.id != event.connection.id;
      });
      console.log(usersConnected);

      // handlePublisher(publisher);
    });

    // Subscribe to a newly created stream
    this.session.on('streamCreated', event => {
      const subscriberOptions = {
        insertMode: 'append',
        width: '100%',
        height: '100%'
        // fitMode: "cover"
      };
      this.session.subscribe(
        event.stream,
        'subscriber',
        subscriberOptions,
        this.handleError
      );
    });

    this.session.on('sessionDisconnected', function sessionDisconnected(event) {
      console.log('You were disconnected from the session.', event.reason);
    });

    // initialize the publisher
    const publisherOptions = {
      insertMode: 'append',
      width: '100%',
      height: '100%',
      publishAudio: true,
      publishVideo: true,
      style: { buttonDisplayMode: 'off' }
    };

    this.publisher = OT.initPublisher(
      'publisher',
      publisherOptions,
      this.handleError
    );

    this.publisher.on('streamCreated', event => {
      console.log('[Publisher] - streamCreated', event);
      this.isPublishing = true;
    });
    this.publisher.on('streamDestroyed', event => {
      console.log('[Publisher] - streamDestroyed', event.reason);
      // event.preventDefault();
      this.isPublishing = false;
    });
    this.publisher.on('audioLevelUpdated', event => {
      this.calculateAudioLevel(event.audioLevel);
    });
    this.publisher.on('accessAllowed', () => {
      refreshDeviceList(this.publisher);
    });

    // Connect to the session
    this.session.connect(token, error => {
      if (error) {
        this.handleError(error);
      } else {
        this.handlePublisher();

        console.log('Session Connected');
      }
    });
  }

  handlePublisher() {
    console.log('[handlePublish]');
    if (!this.isPublishing) {
      // todo publish twice the same stream explode everything
      this.session.publish(this.publisher, this.handleError);
    } else if (connectionCount > 1 && pub) {
      this.session.unpublish(this.publisher);
    }
  }

  disconnectAll() {
    handlePublisher(publisher);
    usersConnected.map(connection => {
      console.log('disconnecting ' + connection.id);
      // if (connection != session.connection.id) {

      session.forceDisconnect(connection);
      // }
    });
  }

  // document.getElementById('endCallButton').addEventListener('click', () => {
  //       disconnectAll();
  //     });

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
    this.publisher.publishVideo(this.hasVideo);
  }

  toggleAudio() {
    this.hasAudio = !this.hasAudio;
    if (!this.hasAudio) {
      document.getElementById('micIcon').src = './icons/mic-mute-fill.svg';
    } else {
      document.getElementById('micIcon').src = './icons/mic-fill.svg';
    }
    this.publisher.publishAudio(this.hasAudio);
  }

  //   cameraButton.addEventListener('click', () => {
  //     toggleVideo();
  //   });

  //   document.getElementById('videoInputs').addEventListener('change', e => {
  //     onVideoSourceChanged(e, publisher);
  //   });

  //   navigator.mediaDevices.ondevicechange = () => {
  //     console.log('Media Devices change detected, refreshing list');
  //     refreshDeviceList();
  //   };

  //   micButton.addEventListener('click', () => {
  //     toggleAudio();
  //   });
}
