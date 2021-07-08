export const handleTestProgressIndicator = () => {
  const progressIndicator = setInterval(() => {
    let currentProgress = document.getElementById('progress').value;
    document.getElementById('progress').value += 2;
    if (currentProgress === 100) {
      clearInterval(progressIndicator);
      document.getElementById('progress').value = 0;
    }
  }, 1000);
};
