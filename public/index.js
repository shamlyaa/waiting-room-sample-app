const urlParams = new URLSearchParams(window.location.search);
const roomName = urlParams.get('room');

let connectionCount = 0;
// let isPublishing = false;
let usersConnected = [];

function handleError(error) {
  if (error) {
    console.error(error);
  }
}

const isHostPresent = () => {
  if (usersConnected.find(e => e.data === 'admin')) {
    return true;
  } else {
    return false;
  }
};

// initializeSession();

function refreshDeviceList(pub) {
  console.log('refreshDeviceList');
  listVideoInputs().then(devices => {
    const videoSelect = document.getElementById('videoInputs');
    videoSelect.innerHTML = '';
    const currentVideoSource = pub.getVideoSource();

    // Select Input
    const currentVideoOption = document.createElement('option');
    //disabledOption.disabled = true;
    currentVideoOption.innerText = currentVideoSource.track.label;
    currentVideoOption.classList.add('dropdown-item');
    currentVideoOption.value = currentVideoSource.label;
    currentVideoOption.selected = true;
    videoSelect.appendChild(currentVideoOption);

    for (let i = 0; i < devices.length; i += 1) {
      if (devices[i].deviceId != currentVideoSource.deviceId) {
        const deviceOption = document.createElement('option');
        deviceOption.classList.add('dropdown-item');
        deviceOption.innerText = devices[i].label || `Video Input ${i + 1}`;
        deviceOption.value = `video-source-${i}`;

        videoSelect.appendChild(deviceOption);
      }
    }

    if (devices.length === 0) {
      const deviceOption = document.createElement('option');
      deviceOption.innerText = 'Default Video Input';
      deviceOption.value = `default-video`;

      videoSelect.appendChild(deviceOption);
    }
  });

  listAudioInputs().then(devices => {
    const audioSelect = document.getElementById('audioInputs');
    audioSelect.innerHTML = '';
    const currentAudioSource = pub.getAudioSource();
    console.log(currentAudioSource);
    console.log(devices);

    // Select Input
    const currentAudioOption = document.createElement('option');
    currentAudioOption.innerText = currentAudioSource.label;
    currentAudioOption.value = 'select';
    currentAudioOption.selected = true;
    audioSelect.appendChild(currentAudioOption);

    for (let i = 0; i < devices.length; i += 1) {
      if (devices[i].label != currentAudioSource.label) {
        console.log(devices[i].deviceId, currentAudioSource.id);
        const deviceOption = document.createElement('option');
        deviceOption.innerText = devices[i].label || `Audio Input ${i + 1}`;
        deviceOption.value = `audio-source-${i}`;

        audioSelect.appendChild(deviceOption);
      }
    }

    if (devices.length === 0) {
      const deviceOption = document.createElement('option');
      deviceOption.innerText = 'Default Audio Input';
      deviceOption.value = `default-audio`;

      audioSelect.appendChild(deviceOption);
    }
  });
}

const onVideoSourceChanged = async (event, publisher) => {
  const value = event.target.value.replace('video-source-', '');

  const index = parseInt(value, 10);
  videoDeviceIndex = index;

  if (videoDeviceIndex > -1) {
    const videoDevice = await getVideoInput(videoDeviceIndex);
    if (videoDevice != null) {
      publisher.setVideoSource(videoDevice.deviceId);
    }
  }
};

const onAudioSourceChanged = async (event, publisher) => {
  const value = event.target.value.replace('audio-source-', '');

  const index = parseInt(value, 10);
  audioDeviceIndex = index;

  if (audioDeviceIndex > -1) {
    const audioDevice = await getAudioInput(audioDeviceIndex);
    if (audioDevice != null) {
      publisher.setAudioSource(audioDevice.deviceId);
    }
  }
};

const getVideoInput = async index => {
  try {
    const devices = await listVideoInputs();

    if (devices.length > index) {
      return Promise.resolve(devices[index]);
    }

    return Promise.resolve(null);
  } catch (error) {
    return Promise.reject(error);
  }
};

const getAudioInput = async index => {
  try {
    const devices = await listAudioInputs();
    if (devices.length > index) {
      return Promise.resolve(devices[index]);
    }
    return Promise.resolve(null);
  } catch (error) {
    return Promise.reject(error);
  }
};

const listAudioInputs = async () => {
  try {
    const devices = await listDevices();
    const filteredDevices = devices.filter(
      device => device.kind === 'audioInput'
    );
    return Promise.resolve(filteredDevices);
  } catch (error) {
    return Promise.reject(error);
  }
};

const listVideoInputs = async () => {
  try {
    const devices = await listDevices();
    const filteredDevices = devices.filter(
      device => device.kind === 'videoInput'
    );
    return Promise.resolve(filteredDevices);
  } catch (error) {
    return Promise.reject(error);
  }
};

const listDevices = () => {
  return new Promise((resolve, reject) => {
    OT.getDevices((error, devices) => {
      if (error) {
        reject(error);
      } else {
        resolve(devices);
      }
    });
  });
};

async function waitForTestEnd(pub) {
  await sleep(3000);
  precallTestDone ? handlePublisher(pub) : waitForTestEnd(pub);
}

const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const startTest = () => {
  return new Promise((resolve, reject) => {
    otNetworkTest = new OTNetworkTest({
      apiKey: '46264952',
      resolution: '640x480',
      sessionId:
        '2_MX40NjI2NDk1Mn5-MTYyNTQ4NjU2OTYxOX5jVFQvWUFZeGQvVGFITkR2V0xzeVlOejF-fg',
      token:
        'T1==cGFydG5lcl9pZD00NjI2NDk1MiZzaWc9ODFkNTQ5NTEwM2MxNWY3YWQyNGNlOWE4ZDA0MzBhYjFhNDFmZDZjMTpzZXNzaW9uX2lkPTJfTVg0ME5qSTJORGsxTW41LU1UWXlOVFE0TmpVMk9UWXhPWDVqVkZRdldVRlplR1F2VkdGSVRrUjJWMHh6ZVZsT2VqRi1mZyZjcmVhdGVfdGltZT0xNjI1NDg3MjM1Jm5vbmNlPTAuNDQwMTI5NzA0Nzk2MzUxNSZyb2xlPW1vZGVyYXRvciZleHBpcmVfdGltZT0xNjI1NTczNjM1JmNvbm5lY3Rpb25fZGF0YT1hZG1pbiZpbml0aWFsX2xheW91dF9jbGFzc19saXN0PQ=='
    });
    otNetworkTest.startNetworkTest((error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};
