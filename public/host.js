window.onload = () => {
  const basicUrl = 'http://localhost:3000';
  let roomApiKey;
  let roomSessionId;
  let roomToken;
  let session = null;
  let publisher = null;
  let isPublishing = false;
  let hasVideo = true;
  let hasAudio = true;

  async function getCredentials() {
    try {
      const url = `/api/room/${roomName}?role=admin`;
      const config = {};
      const response = await fetch(`${basicUrl}${url}`, config);
      const data = await response.json();
      console.log(data);
      if (data.apiKey && data.sessionId && data.token) {
        roomApiKey = data.apiKey;
        roomSessionId = data.sessionId;
        roomToken = data.token;
        return Promise.resolve(data);
      }
    } catch (error) {
      console.log(error.message);
      return Promise.reject(error);
    }
  }

  getCredentials().then(data => {
    initializeSession(data);
  });

  function initializeSession(data) {
    const { apiKey, sessionId, token } = data;
    session = OT.initSession(apiKey, sessionId);

    session.on('connectionCreated', function(event) {
      connectionCount += 1;
      usersConnected.push(event.connection);
      console.log(usersConnected);
      console.log('[connectionCreated]', connectionCount);

      // console.log(isHostPresent());

      // handlePublisher(publisher);
    });

    session.on('connectionDestroyed', function(event) {
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
    session.on('streamCreated', function streamCreated(event) {
      const subscriberOptions = {
        insertMode: 'append',
        width: '100%',
        height: '100%'
        // fitMode: "cover"
      };
      session.subscribe(
        event.stream,
        'subscriber',
        subscriberOptions,
        handleError
      );
    });

    session.on('sessionDisconnected', function sessionDisconnected(event) {
      console.log('You were disconnected from the session.', event.reason);
    });

    // initialize the publisher
    var publisherOptions = {
      insertMode: 'append',
      width: '100%',
      height: '100%',
      publishAudio: true,
      publishVideo: true
    };
    publisher = OT.initPublisher('publisher', publisherOptions, handleError);
    publisher.on('streamCreated', event => {
      console.log('[Publisher] - streamCreated', event);
      isPublishing = true;
    });
    publisher.on('streamDestroyed', event => {
      console.log('[Publisher] - streamDestroyed', event.reason);
      // event.preventDefault();
      isPublishing = false;
    });
    publisher.on('audioLevelUpdated', event => {
      calculateAudioLevel(event.audioLevel);
    });
    publisher.on('accessAllowed', () => {
      refreshDeviceList(publisher);
    });

    // Connect to the session
    session.connect(token, function callback(error) {
      if (error) {
        handleError(error);
      } else {
        handlePublisher(publisher);
        console.log('Session Connected');
      }
    });
  }

  function handlePublisher(pub) {
    console.log('[handlePublish]', pub);
    if (!isPublishing) {
      // todo publish twice the same stream explode everything
      session.publish(pub, handleError);
    } else if (connectionCount > 1 && pub) {
      session.unpublish(pub);
    }
  }

  const disconnectAll = () => {
    handlePublisher(publisher);
    usersConnected.map(connection => {
      console.log('disconnecting ' + connection.id);
      // if (connection != session.connection.id) {

      session.forceDisconnect(connection);
      // }
    });
  };

  document.getElementById('endCallButton').addEventListener('click', () => {
    disconnectAll();
  });

  const calculateAudioLevel = audioLevel => {
    let movingAvg = null;
    if (movingAvg === null || movingAvg <= audioLevel) {
      movingAvg = audioLevel;
    } else {
      movingAvg = 0.8 * movingAvg + 0.2 * audioLevel;
    }
    // console.log(movingAvg);
    // 1.5 scaling to map the -30 - 0 dBm range to [0,1]
    const currentLogLevel = Math.log(movingAvg) / Math.LN10 / 1.5 + 1;
    setLogLevel(Math.min(Math.max(currentLogLevel, 0), 1) * 100);
    // console.log(Math.min(Math.max(currentLogLevel, 0), 1) * 100);
  };

  const setLogLevel = logLevel => {
    document.getElementById('audioMeter').value = logLevel;
  };

  const toggleVideo = () => {
    hasVideo = !hasVideo;
    if (!hasVideo) {
      document.getElementById('cameraIcon').src =
        './icons/camera-video-off-fill.svg';
    } else {
      document.getElementById('cameraIcon').src =
        './icons/camera-video-fill.svg';
    }
    publisher.publishVideo(hasVideo);
  };

  const toggleAudio = () => {
    hasAudio = !hasAudio;
    if (!hasAudio) {
      document.getElementById('micIcon').src = './icons/mic-mute-fill.svg';
    } else {
      document.getElementById('micIcon').src = './icons/mic-fill.svg';
    }

    publisher.publishAudio(hasAudio);
  };

  cameraButton.addEventListener('click', () => {
    toggleVideo();
  });

  document.getElementById('videoInputs').addEventListener('change', e => {
    onVideoSourceChanged(e, publisher);
  });

  navigator.mediaDevices.ondevicechange = () => {
    console.log('Media Devices change detected, refreshing list');
    refreshDeviceList();
  };

  micButton.addEventListener('click', () => {
    toggleAudio();
  });

  document.getElementById('audioInputs').addEventListener('change', e => {
    e.preventDefault();
    onAudioSourceChanged(e, waitingRoompublisher);
  });
};
