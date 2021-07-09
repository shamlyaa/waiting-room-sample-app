export const displayQualityError = error => {
  const errorMessage = `
    <div class="alert alert-danger alert-dismissible fade show alert-centered" role="alert">
    <div class="qualityData">${error}</div>
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`;
  document
    .getElementById('banner')
    .insertAdjacentHTML('beforeend', errorMessage);
};
