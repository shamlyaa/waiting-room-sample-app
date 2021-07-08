let progressBar = document.getElementById('progress');

export const handleTestProgressIndicator = () => {
  const progressIndicator = setInterval(() => {
    let currentProgress = progressBar.value;
    progressBar.value += 2.5;
    if (currentProgress === 100) {
      clearInterval(progressIndicator);
      progressBar.value = 0;
      progressBar.style.display = 'none';
    }
  }, 1000);
};

export const removeProgressIndicator = () => {
  progressBar.style.display = 'none';
};
