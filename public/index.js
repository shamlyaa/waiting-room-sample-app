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
