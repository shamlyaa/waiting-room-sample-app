import { ErrorNames } from 'opentok-network-test-js';

import variables from './variables';
const { addFeedback } = variables;

export const addQualityTestResults = results => {
  const classResult =
    results.audio.supported && results.video.supported
      ? 'alert-success'
      : 'alert-warning';

  console.log(addFeedback);

  const getFeedbackLabel = mos => {
    if (mos) {
      if (mos > 1 && mos < 1.69) return 'Bad';
      if (mos > 1.7 && mos < 2.39) return 'Poor';
      if (mos > 2.4 && mos < 3.09) return 'Fair';
      if (mos > 3.1 && mos < 3.79) return 'Good';
      if (mos > 3.8 && mos < 4.5) return 'Excellent';
    }
    return;
  };

  const recommendedValues = `
  <div class="qualityData">Recommended Resolution : ${
    results?.video?.recommendedResolution
  }</div>
  <div class="qualityData">Score : ${getFeedbackLabel(
    results?.video?.mos
  )}</div>
  
  `;

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
          ${addFeedback ? recommendedValues : ''}
          
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>`;

  document
    .getElementById('banner')
    .insertAdjacentHTML('beforeend', precallResult);
  //   document.getElementById('progress').style.display = 'none';
};
