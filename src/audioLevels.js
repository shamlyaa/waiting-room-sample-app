export const calculateAudioLevel = audioLevel => {
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

export const setLogLevel = logLevel => {
  document.getElementById('audioMeter').value = logLevel;
};
