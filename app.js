// NASA APOD


const API_URL = 'https://api.nasa.gov/planetary/apod';
const FIRST_APOD = '1995-06-16';

// DOM
const datePicker = document.getElementById('date-picker');
const exploreBtn = document.getElementById('explore-btn');
const resultContainer = document.getElementById('result-container');
const imageFrame = document.getElementById('image-frame');
const apodImage = document.getElementById('apod-image');
const apodVideo = document.getElementById('apod-video');
const expandHint = document.getElementById('expand-hint');
const imageTitle = document.getElementById('image-title');
const imageDate = document.getElementById('image-date');
const imageDescription = document.getElementById('image-description');
const statusMessage = document.getElementById('status-message');
const scrollCue = document.getElementById('scroll-cue');

// The key lives in config.js. 
const API_KEY =
  typeof CONFIG !== 'undefined' && CONFIG.NASA_API_KEY ? CONFIG.NASA_API_KEY : null;

/* ------------------------------------------------------------------
   Dates
   ------------------------------------------------------------------ */

const today = new Date().toISOString().split('T')[0];

datePicker.setAttribute('min', FIRST_APOD);
datePicker.setAttribute('max', today);
datePicker.value = today;

/* ------------------------------------------------------------------
   Status line
   ------------------------------------------------------------------ */

function setStatus(text, isError) {
  statusMessage.textContent = text || '';
  statusMessage.classList.toggle('is-error', Boolean(isError));
}

function setBusy(isBusy) {
  exploreBtn.disabled = isBusy;
  exploreBtn.textContent = isBusy ? 'Fetching' : 'Explore';
}

/* ------------------------------------------------------------------
   Fetch
   ------------------------------------------------------------------ */

async function fetchAPOD(date) {
  if (!API_KEY) {
    setStatus('No API key found. Check that config.js loads before app.js.', true);
    return;
  }

  setBusy(true);
  setStatus('Fetching that day from NASA\u2026');

  try {
    const response = await fetch(`${API_URL}?api_key=${API_KEY}&date=${date}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Nothing was published on that date. Try the day before.');
      }
      if (response.status === 429 || response.status === 403) {
        throw new Error('Too many requests for this key. Wait an hour, or use your own NASA key.');
      }
      if (response.status === 400) {
        throw new Error('That date is outside the archive. Pick a day from 16 June 1995 onwards.');
      }
      throw new Error('NASA returned an error. Try again in a moment.');
    }

    const data = await response.json();
    displayAPOD(data);
    setStatus('');
  } catch (error) {
    console.error('Error fetching APOD:', error);
    setStatus(error.message || 'Could not reach NASA. Check your connection.', true);
  } finally {
    setBusy(false);
  }
}

/* ------------------------------------------------------------------
   Display
   ------------------------------------------------------------------ */

function displayAPOD(data) {
  imageTitle.textContent = data.title;
  imageDate.textContent = formatDate(data.date);
  imageDescription.textContent = data.explanation;

  if (data.media_type === 'image') {
    apodVideo.hidden = true;
    apodVideo.removeAttribute('src');

    apodImage.hidden = false;
    apodImage.src = data.hdurl || data.url;
    apodImage.alt = data.title;
    expandHint.hidden = false;
  } else {
    // Video days: an <img> cannot render a YouTube or Vimeo embed.
    apodImage.hidden = true;
    apodImage.removeAttribute('src');
    expandHint.hidden = true;

    apodVideo.hidden = false;
    apodVideo.src = data.url;
    apodVideo.title = data.title;
  }

  resultContainer.classList.remove('hidden');
  if (scrollCue) scrollCue.hidden = false;
}

function formatDate(iso) {
  const parts = iso.split('-');
  const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  });
}

/* ------------------------------------------------------------------
   Controls
   ------------------------------------------------------------------ */

exploreBtn.addEventListener('click', () => {
  const selectedDate = datePicker.value;

  if (!selectedDate) {
    setStatus('Choose a date first.', true);
    return;
  }

  fetchAPOD(selectedDate);
});

datePicker.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    exploreBtn.click();
  }
});

/* ------------------------------------------------------------------
   Scroll cue
   ------------------------------------------------------------------ */

if (scrollCue) {
  scrollCue.addEventListener('click', () => {
    imageTitle.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

/* ------------------------------------------------------------------
   Lightbox
   ------------------------------------------------------------------ */

const lightbox = document.createElement('div');
lightbox.className = 'lightbox';
lightbox.setAttribute('role', 'dialog');
lightbox.setAttribute('aria-modal', 'true');
lightbox.setAttribute('aria-label', 'Full size image');

const lightboxImage = document.createElement('img');

const lightboxClose = document.createElement('button');
lightboxClose.className = 'lightbox-close';
lightboxClose.type = 'button';
lightboxClose.setAttribute('aria-label', 'Close full size image');
lightboxClose.innerHTML = '&times;';

lightbox.appendChild(lightboxImage);
lightbox.appendChild(lightboxClose);
document.body.appendChild(lightbox);

let lastFocused = null;

function openLightbox() {
  if (!apodImage.getAttribute('src') || apodImage.hidden) return;

  lastFocused = document.activeElement;
  lightboxImage.src = apodImage.src;
  lightboxImage.alt = apodImage.alt;
  lightbox.classList.add('is-open');
  document.body.classList.add('lightbox-open');
  lightboxClose.focus();
}

function closeLightbox() {
  lightbox.classList.remove('is-open');
  document.body.classList.remove('lightbox-open');
  lightboxImage.removeAttribute('src');
  if (lastFocused) lastFocused.focus();
}

apodImage.addEventListener('click', openLightbox);

apodImage.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    openLightbox();
  }
});

lightboxClose.addEventListener('click', closeLightbox);

lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && lightbox.classList.contains('is-open')) {
    closeLightbox();
  }
});

// Keep keyboard focus inside the dialog while it is open.
lightbox.addEventListener('keydown', (event) => {
  if (event.key === 'Tab') {
    event.preventDefault();
    lightboxClose.focus();
  }
});

/* ------------------------------------------------------------------
   Load today's picture on arrival
   ------------------------------------------------------------------ */

fetchAPOD(today);
