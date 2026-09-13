// NASA APOD


const BASE = 'https://science.nasa.gov/wp-json/wp/v2/image-article';
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

function decodeHtml(s) {
  const el = document.createElement('textarea');
  el.innerHTML = s;
  return el.value;
}

function htmlToText(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent.replace(/\s+/g, ' ').trim();
}

function extractExplanation(html) {
  const text = htmlToText(html);

  // The caption always begins after "Explanation:".
  const start = text.indexOf('Explanation:');
  let body = start === -1 ? text : text.slice(start + 'Explanation:'.length);

  // Trailing site furniture: "Tomorrow's picture", credits, APOD footer.
  const end = body.search(/Tomorrow'?s picture|Authors? & editors|APOD is featured|Image Credit/i);
  if (end > 0) body = body.slice(0, end);

  return body.trim();
}

// Function
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];

async function fetchFromApi(date) {
  const [y, m, d] = date.split('-').map(Number);
  const query = `APOD ${y} ${MONTHS[m - 1]} ${d}`;

  const matches = (p) => {
    const parts = /^APOD:\s*(\d{4})\s+([A-Za-z]+)\s+(\d{1,2})/.exec(decodeHtml(p.title.rendered));
    return parts
      && Number(parts[1]) === y
      && MONTHS.indexOf(parts[2]) === m - 1
      && Number(parts[3]) === d;
  };

  let post = null;

  for (let page = 1; page <= 5 && !post; page++) {
    const res = await fetch(`${BASE}?search=${encodeURIComponent(query)}&per_page=100&page=${page}`);

    if (res.status === 400) break;   // ran past the last page
    if (!res.ok) throw new Error('NASA returned an error. Try again in a moment.');

    const posts = await res.json();
    if (!posts.length) break;

    post = posts.find(matches) || null;
  }

  if (!post) {
    throw new Error('Nothing was published on that date. Try the day before.');
  }

  const title = decodeHtml(post.title.rendered)
    .replace(/^APOD:\s*\d{4}\s+\S+\s+\d{1,2}\s*[–—-]\s*/, '')
    .trim();

  const body = new DOMParser().parseFromString(post.content.rendered, 'text/html');
  const iframe = body.querySelector('iframe');

  return {
    title,
    date,                                    // trust the requested date, not post.date
    explanation: extractExplanation(post.content.rendered),
    media_type: iframe ? 'video' : 'image',
    url: iframe ? iframe.src : post.featured_image_url,
    hdurl: post.source_asset_url || null
  };
}

// UI wrapper. 
async function fetchAPOD(date) {
  setBusy(true);
  setStatus('Fetching that day from NASA\u2026');

  try {
    displayAPOD(await fetchFromApi(date));
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
