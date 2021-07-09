import { ErrorNames } from 'opentok-network-test-js';
export const addQualityTestResults = results => {
  const classResult =
    results.audio.supported && results.video.supported
      ? 'alert-success'
      : 'alert-warning';
  let message = [];

  let publisherSettings = {};
  if (results.video.reason) {
    console.log('Video not supported:', results.video.reason);
    publisherSettings.videoSource = null; // audio-only
  } else {
    publisherSettings.frameRate = results.video.recommendedFrameRate;
    publisherSettings.resolution = results.video.recommendedResolution;
  }
  if (!results.audio.supported) {
    console.log('Audio not supported:', results.audio.reason);
    // video-only, but you probably don't want this -- notify the user?
  }
  if (!publisherSettings.videoSource && !publisherSettings.audioSource) {
    // Do not publish. Notify the user.
  } else {
    // Publish to the "real" session, using the publisherSettings object.
  }

  console.log(message);

  const precallResult = `
          <div class="alert ${classResult} alert-dismissible fade show alert-centered" role="alert">
          <div class="qualityData">Quality check : Done</div>
          <div class="qualityData">Audio Supported : ${
            results.audio.supported
          } <img src="${
    results.audio.supported ? '/icons/check-lg.svg' : '/icons/x-lg.svg'
  }" class="mediaSupported" alt="" width="6%" />
          </div>
          <div class="qualityData">Audio Kbps : ${Math.round(
            results.audio?.bitrate
          ) / 1000}</div>
          <div class="qualityData">Video Supported : 
          ${results.video.supported} <img src="${
    results.video.supported ? '/icons/check-lg.svg' : '/icons/x-lg.svg'
  }" class="mediaSupported" alt="" width="6%" /></div>
          <div class="qualityData">Video Kbps : ${Math.round(
            results.video?.bitrate
          ) / 1000}</div>
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>`;

  document
    .getElementById('banner')
    .insertAdjacentHTML('beforeend', precallResult);
  //   document.getElementById('progress').style.display = 'none';
};
