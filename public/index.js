const urlParams = new URLSearchParams(window.location.search);
const roomName = urlParams.get('room');

let connectionCount = 0;
let session = null;
let publisher = null;
let isPublishing = false;
let usersConnected = [];

function handleError(error) {
  if (error) {
    console.error(error);
  }
}

function handlePublisher(pub) {
  console.log('[handlePublish]', connectionCount);
  if (!isPublishing) {
    // todo publish twice the same stream explode everything
    session.publish(pub, handleError);
  } else if (connectionCount === 0 && publisher) {
    session.unpublish(pub);
  }
}

function initializeSession(data) {
  const { apiKey, sessionId, token } = data;
  session = OT.initSession(apiKey, sessionId);

  session.on('connectionCreated', function(event) {
    usersConnected.push(event.connection);
    console.log(usersConnected);
    console.log('[connectionCreated]', connectionCount);

    console.log(isHostPresent());

    connectionCount += 1;
    handlePublisher(publisher);
  });

  session.on('connectionDestroyed', function(event) {
    console.log('[connectionDestroyed]', connectionCount);
    usersConnected.filter(connection => connection.id != event.connection.id);
    console.log(usersConnected);
    connectionCount -= 1;
    handlePublisher(publisher);
  });

  // Subscribe to a newly created stream
  session.on('streamCreated', function streamCreated(event) {
    const subscriberOptions = {
      insertMode: 'append',
      width: '60%',
      height: '60%'
    };
    session.subscribe(
      event.stream,
      'subscribers',
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
    height: '100%'
  };
  publisher = OT.initPublisher('publisher', publisherOptions, handleError);
  publisher.on('streamCreated', event => {
    console.log('[Publisher] - streamCreated', event);
    isPublishing = true;
  });
  publisher.on('streamDestroyed', event => {
    console.log('[Publisher] - streamDestroyed', event.reason);
    event.preventDefault();
    isPublishing = false;
  });

  // Connect to the session
  session.connect(token, function callback(error) {
    if (error) {
      handleError(error);
    } else {
      console.log('Session Connected');
    }
  });
}

const isHostPresent = () => {
  if (usersConnected.find(e => e.data === 'admin')) {
    return true;
  } else {
    return false;
  }
};

const disconnectAll = () => {
  usersConnected.map(connection => {
    console.log('disconnecting ' + connection);
    session.forceDisconnect(connection);
  });
};

// initializeSession();
async function listVideoInputs() {
  try {
    const devices = await listInputs();
    const filteredDevices = devices.filter(
      device => device.kind === 'videoInput'
    );
    return Promise.resolve(filteredDevices);
  } catch (error) {
    return Promise.reject(error);
  }
}

function refreshDeviceList() {
  console.log('refreshDeviceList');
  listVideoInputs().then(devices => {
    const videoSelect = document.getElementById('videoInputs');
    videoSelect.innerHTML = '';

    // Select Input
    const disabledOption = document.createElement('option');
    //disabledOption.disabled = true;
    disabledOption.innerText = 'Select Input';
    // disabledOption.value = 'select';
    // disabledOption.selected = true;
    videoSelect.appendChild(disabledOption);

    for (let i = 0; i < devices.length; i += 1) {
      const device = devices[i];
      const deviceOption = document.createElement('option');
      deviceOption.innerText = device.label || `Video Input ${i + 1}`;
      deviceOption.value = `video-source-${i}`;

      videoSelect.appendChild(deviceOption);
    }

    if (devices.length === 0) {
      const deviceOption = document.createElement('option');
      deviceOption.innerText = 'Default Video Input';
      deviceOption.value = `video-source-vg-default`;

      videoSelect.appendChild(deviceOption);
    }
  });

  listAudioInputs().then(devices => {
    const audioSelect = document.getElementById('audioInputs');
    audioSelect.innerHTML = '';

    // Select Input
    const disabledOption = document.createElement('option');
    disabledOption.disabled = true;
    disabledOption.innerText = 'Select Input';
    disabledOption.value = 'select';
    disabledOption.selected = true;
    audioSelect.appendChild(disabledOption);

    for (let i = 0; i < devices.length; i += 1) {
      const device = devices[i];
      const deviceOption = document.createElement('option');
      deviceOption.innerText = device.label || `Audio Input ${i + 1}`;
      deviceOption.value = `audio-source-${i}`;

      audioSelect.appendChild(deviceOption);
    }

    if (devices.length === 0) {
      const deviceOption = document.createElement('option');
      deviceOption.innerText = 'Default Audio Input';
      deviceOption.value = `audio-source-vg-default`;

      audioSelect.appendChild(deviceOption);
    }
  });
}

async function listAudioInputs() {
  try {
    const devices = await listInputs();
    const filteredDevices = devices.filter(
      device => device.kind === 'audioInput'
    );
    return Promise.resolve(filteredDevices);
  } catch (error) {
    return Promise.reject(error);
  }
}

listAudioInputs().then(devices => {
  const audioSelect = document.getElementById('audioInputs');
  audioSelect.innerHTML = '';

  // Select Input
  const disabledOption = document.createElement('option');
  disabledOption.disabled = true;
  disabledOption.innerText = 'Select Input';
  disabledOption.value = 'select';
  disabledOption.selected = true;
  audioSelect.appendChild(disabledOption);

  for (let i = 0; i < devices.length; i += 1) {
    const device = devices[i];
    const deviceOption = document.createElement('option');
    deviceOption.innerText = device.label || `Audio Input ${i + 1}`;
    deviceOption.value = `audio-source-${i}`;

    audioSelect.appendChild(deviceOption);
  }

  if (devices.length === 0) {
    const deviceOption = document.createElement('option');
    deviceOption.innerText = 'Default Audio Input';

    audioSelect.appendChild(deviceOption);
  }
});

function listInputs() {
  return new Promise((resolve, reject) => {
    OT.getDevices((error, devices) => {
      if (error) {
        reject(error);
      } else {
        resolve(devices);
      }
    });
  });
}
