import variables from './variables';
const { usersConnected } = variables;

export const isHostPresent = () => {
  if (usersConnected.find(e => e.data === 'admin')) {
    return true;
  } else {
    return false;
  }
};

export const refreshDeviceList = pub => {
  console.log('refreshDeviceList');
  listVideoInputs().then(devices => {
    console.log(devices);
    const videoSelect = document.getElementById('videoInputs');
    videoSelect.innerHTML = '';
    const currentVideoSource = pub.getVideoSource();

    // Select Input
    const currentVideoOption = document.createElement('option');
    //disabledOption.disabled = true;
    currentVideoOption.innerText = currentVideoSource.track.label;
    currentVideoOption.classList.add('dropdown-item');
    currentVideoOption.value = currentVideoSource.track.label;
    currentVideoOption.selected = true;
    videoSelect.appendChild(currentVideoOption);

    for (let i = 0; i < devices.length; i += 1) {
      if (devices[i].deviceId != currentVideoSource.deviceId) {
        const deviceOption = document.createElement('option');
        deviceOption.classList.add('dropdown-item');
        deviceOption.innerText = devices[i].label || `Video Input ${i + 1}`;
        // deviceOption.value = `video-source-${i}`;
        deviceOption.value = devices[i].label;

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
    //  audioSelect.innerHTML = '';
    const currentAudioSource = pub.getAudioSource();
    console.log(devices);

    // Select Input
    const currentAudioOption = document.createElement('option');
    currentAudioOption.innerText = currentAudioSource.label;
    currentAudioOption.value = currentAudioSource.label;
    currentAudioOption.selected = true;
    audioSelect.appendChild(currentAudioOption);

    for (let i = 0; i < devices.length; i += 1) {
      if (devices[i].label != currentAudioSource.label) {
        const deviceOption = document.createElement('option');
        deviceOption.innerText = devices[i].label || `Audio Input ${i + 1}`;
        deviceOption.value = devices[i].label;

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
};

export const onVideoSourceChanged = async (event, publisher) => {
  console.log(event);
  const labelToFind = event.target.value;
  const videoDevices = await listVideoInputs();

  const deviceId = videoDevices.find(e => e.label === labelToFind)?.deviceId;

  if (deviceId != null) {
    publisher.setVideoSource(deviceId);
  }
};

export const onAudioSourceChanged = async (event, publisher) => {
  const labelToFind = event.target.value;
  const audioDevices = await listAudioInputs();

  const deviceId = audioDevices.find(e => e.label === labelToFind)?.deviceId;

  if (deviceId != null) {
    publisher.setAudioSource(deviceId);
  }
};

export const listAudioInputs = async () => {
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

export const listVideoInputs = async () => {
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

export const listDevices = () => {
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
