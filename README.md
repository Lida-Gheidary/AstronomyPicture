# End Project – Astronomy Picture of the Day

A simple interactive web page that displays NASA's Astronomy Picture of the Day. Users can select any date and explore stunning space images with detailed descriptions from NASA's archive.

## How It Works

- **HTML** (index.html) creates the structure: header with animated title, date picker, explore button, and a grid layout for displaying images and descriptions.
- **CSS** (style.css) styles the page (gradient background, animations, hover effects, responsive layout using CSS Grid).
- **JavaScript** (app.js) makes the page interactive: it fetches data from NASA's API and updates the page dynamically.

The files are connected in index.html:

<script src="config.js"></script>
<script src="app.js"></script>

CSS loads first (in <head>) so the page looks good right away. JavaScript loads at the end of <body> so it doesn't run before the HTML is ready. The config.js file loads before app.js to provide the API key configuration.

## What happens when you click?

1. The Explore button click triggers a function in app.js
2. JavaScript gets the selected date from the date picker
3. It uses fetch() to call NASA's APOD API: https://api.nasa.gov/planetary/apod?api_key=YOUR_KEY&date=SELECTED_DATE
4. The API returns JSON data containing the image URL, title, date, and description
5. JavaScript updates the page by:
   •	Setting the image source to the API's image URL
   •	Displaying the title in an < h2 > element
   •	Showing the date in a < p > element
   •	Adding the full explanation text in another < p > element
   •	Removing the hidden class from the result container to make it visible


The grid layout automatically positions the image on the left and description on the right. When you hover over the image, it smoothly zooms to 1.5x size for better viewing.

## Setup Instructions

1. Copy config.example.js to config.js
2. Get your NASA API key from https://api.nasa.gov/
3. Replace YOUR_API_KEY_HERE in config.js with your actual key

## How to Run

1. Open index.html in any browser
2. Select a date from the date picker (defaults to today)
3. Click the "Explore" button
4. See the astronomy picture appear with its description

## Project Requirements Met

- ✅ Fetches data from NASA's public API using fetch()
- ✅ Semantic HTML structure with proper elements
- ✅ Responsive CSS layout using Grid and Flexbox
- ✅ Interactive controls (date picker and button)
- ✅ Displays results dynamically without page reload
- ✅ Professional design with animations and hover effects

