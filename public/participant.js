window.onload = () => {
  const basicUrl = 'http://localhost:3000';
  const cameraButton = document.getElementById('cameraButton');
  const micButton = document.getElementById('micButton');
  const publisherOptions = {
    insertMode: 'append',
    width: '100%',
    height: '100%'
  };
  let session = null;
  let waitingRoompublisher = null;
  let hasVideo = true;
  let hasAudio = true;
  let isPublishing = false;
  let precallTestDone = false;

  async function getCredentials() {
    // Default
    try {
      const url = `/api/room/${roomName}?role=participant`;
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
      return Promise.reject(new Error('Credentials Not Valid'));
    } catch (error) {
      console.log(error.message);
      return Promise.reject(error);
    }
  }

  getCredentials().then(data => {
    initializeWaitingRoom(data);
  });

  async function waitForTestToSubscribe(stream) {
    if (precallTestDone) {
      handleSubscriber(stream);
    } else {
      await sleep(3000);
      waitForTestToSubscribe(stream);
    }
  }

  const sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  function initializeWaitingRoom(data) {
    const { apiKey, sessionId, token } = data;
    session = OT.initSession(apiKey, sessionId);

    session.on('connectionCreated', function(event) {
      connectionCount += 1;
      console.log('[connectionCreated]', connectionCount);
      usersConnected.push(event.connection);
      console.log(usersConnected);

      if (isHostPresent() || event.connection.data === 'admin') {
        if (precallTestDone) {
          handlePublisher();
        }
      }
    });

    session.on('connectionDestroyed', event => {
      connectionCount -= 1;
      console.log('[connectionDestroyed]', connectionCount);
      usersConnected = usersConnected.filter(connection => {
        return connection.id != event.connection.id;
      });
      connectionCount -= 1;
      console.log(usersConnected);
    });

    session.on('streamCreated', event => {
      if (!precallTestDone) {
        waitForTestToSubscribe(event.stream);
      } else {
        handleSubscriber(event.stream);
      }
    });

    // initialize the publisher

    waitingRoompublisher = OT.initPublisher(
      'publisher',
      publisherOptions,
      handleError
    );

    waitingRoompublisher.on({
      accessAllowed: event => {
        console.log('accessAllowed');
        refreshDeviceList(waitingRoompublisher);
      },
      accessDenied: () => {
        alert('Please grant devices access');
        // The user has denied access to the camera and mic.
      },
      audioLevelUpdated: event => {
        calculateAudioLevel(event.audioLevel);
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
    session.connect(token, error => {
      if (error) {
        handleError(error);
      } else {
        console.log('Session Connected');
      }
    });
  }

  function handlePublisher() {
    console.log('[handlePublish]');
    if (!isPublishing && connectionCount > 1) {
      session.publish(waitingRoompublisher, handleError);
    }
  }

  function handleSubscriber(stream) {
    const subscriberOptions = {
      insertMode: 'append',
      width: '100%',
      height: '100%'
    };
    session.subscribe(stream, 'subscriber', subscriberOptions, handleError);
  }

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
    waitingRoompublisher.publishVideo(hasVideo);
  };

  const toggleAudio = () => {
    hasAudio = !hasAudio;
    if (!hasAudio) {
      document.getElementById('micIcon').src = './icons/mic-mute-fill.svg';
    } else {
      document.getElementById('micIcon').src = './icons/mic-fill.svg';
    }
    waitingRoompublisher.publishAudio(hasAudio);
  };

  cameraButton.addEventListener('click', () => {
    toggleVideo();
  });

  document.getElementById('videoInputs').addEventListener('change', e => {
    onVideoSourceChanged(e, waitingRoompublisher);
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

  const handleTest = async () => {
    try {
      const result = await startTest();
      precallTestDone = true;
      if (isHostPresent()) handlePublisher();
      return result;
    } catch (e) {
      console.log(e);
    }
  };

  function addTestResults(result) {
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

  const handleTestProgressIndicator = () => {
    const progressIndicator = setInterval(() => {
      let currentProgress = document.getElementById('progress').value;
      document.getElementById('progress').value += 5;
      if (currentProgress === 100) {
        clearInterval(progressIndicator);
        document.getElementById('progress').value = 0;
      }
    }, 1000);
  };

  handleTestProgressIndicator();
  handleTest().then(result => {
    addTestResults(result);
  });
};
