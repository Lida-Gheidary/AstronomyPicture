// NASA APOD API Configuration
const API_KEY = CONFIG.NASA_API_KEY;
const API_URL = 'https://api.nasa.gov/planetary/apod';

// Get DOM elements
const datePicker = document.getElementById('date-picker');
const exploreBtn = document.getElementById('explore-btn');
const resultContainer = document.getElementById('result-container');
const apodImage = document.getElementById('apod-image');
const imageTitle = document.getElementById('image-title');
const imageDate = document.getElementById('image-date');
const imageDescription = document.getElementById('image-description');

// Set max date to today
const today = new Date().toISOString().split('T')[0];
datePicker.setAttribute('max', today);
datePicker.value = today;

// Fetch APOD data
async function fetchAPOD(date) {
  try {
    const response = await fetch(`${API_URL}?api_key=${API_KEY}&date=${date}`);

    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    const data = await response.json();
    displayAPOD(data);
  } catch (error) {
    console.error('Error fetching APOD:', error);
    alert('Failed to fetch the astronomy picture. Please try again.');
  }
}

// Display APOD data
function displayAPOD(data) {
  imageTitle.textContent = data.title;
  imageDate.textContent = `Date: ${data.date}`;
  imageDescription.textContent = data.explanation;

  // Handle both images and videos
  if (data.media_type === 'image') {
    apodImage.src = data.url;
    apodImage.alt = data.title;
    apodImage.style.display = 'block';
  } else {
    // If it's a video, you might want to handle it differently
    apodImage.src = data.url;
    apodImage.alt = data.title;
  }

  // Show result container
  resultContainer.classList.remove('hidden');
}

// Event listener for Explore button
exploreBtn.addEventListener('click', () => {
  const selectedDate = datePicker.value;

  if (selectedDate) {
    fetchAPOD(selectedDate);
  } else {
    alert('Please select a date');
  }
});

// Optional: Load today's APOD on page load
// fetchAPOD(today);
