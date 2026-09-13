# End Project – Astronomy Picture of the Day

A simple interactive web page that displays NASA's Astronomy Picture of the Day. Users can select any date since 16 June 1995 and explore stunning space images with the accompanying explanation from NASA's archive.

## How It Works

- **HTML** (`index.html`) creates the structure: a sticky side panel with the title, date picker and Explore button, plus a stage area where the image and its description appear.
- **CSS** (`style.css`) styles the page — starfield background, responsive two-column layout, hover and focus states, and a full-screen lightbox.
- **JavaScript** (`app.js`) makes the page interactive: it fetches data from NASA's API and updates the page dynamically.

Only one script is loaded, at the end of `<body>` so it doesn't run before the HTML is ready:

```html
<script src="app.js"></script>
```

The stylesheet loads in `<head>` so the page looks right immediately.

## Where the data comes from

NASA moved APOD from `apod.nasa.gov` to `science.nasa.gov/apod` during August and September 2026, and the old `api.nasa.gov/planetary/apod` endpoint is scheduled to go offline on 1 December 2026. This project now reads from the WordPress REST API that replaced it:

```
https://science.nasa.gov/wp-json/wp/v2/image-article
```

No API key is required — the endpoint is public.

## What happens when you click?

1. The Explore button click triggers a handler in `app.js`.
2. JavaScript reads the selected date from the date picker.
3. `fetchFromApi()` searches the `image-article` collection for that day's post.
4. The matching post is normalised into a simple object: `title`, `date`, `explanation`, `media_type`, `url`, `hdurl`.
5. `displayAPOD()` updates the page — image source, title, formatted date, explanation text — and removes the `hidden` class from the result container.

The layout then arranges itself: a tall portrait image leaves room for the text beside it, while a wide landscape one pushes the description underneath. Clicking the image opens it full size in a lightbox, closed with Escape, the close button, or a click outside.

## Why the fetch is more involved than before

The old API took a `date` parameter and returned one object. The WordPress API doesn't work that way, so `fetchFromApi()` does three extra things:

- **Searches by title, not date.** Every APOD post is titled `APOD: 2026 September 13 – …`. WordPress's own `date` field is the CMS publish date, and because the whole archive was bulk-imported during the migration, those timestamps are useless for finding old entries.
- **Pages through results.** Search ranks by relevance across the entire post, so a query like `APOD 1999` also matches posts that merely mention "NGC 1999". The loop requests up to five pages and stops as soon as a title parses to the exact date requested.
- **Cleans the text.** The post body arrives as HTML with site navigation attached. `extractExplanation()` cuts everything before `Explanation:` and trims the trailing credits.

Everything that touches the DOM is kept separate from everything that touches the network. If NASA changes the API again, only `fetchFromApi()` needs rewriting.

## Setup

No setup, no API key, no dependencies.

## How to Run

1. Open `index.html` in any browser.
2. Today's picture loads automatically.
3. Pick a different date and click **Explore** to see that day's image.

If the image fails to load when opening the file directly, serve the folder over a local server instead — for example `python3 -m http.server` — and visit `http://localhost:8000`.

## Known limitations

- Video days are detected by looking for an `<iframe>` in the post body. This is less reliable than the old API's explicit `media_type` field.
- Image credits are not shown. The old API returned a separate `copyright` field; the WordPress body mixes attribution into the same text as the caption.
- An old date may need up to five requests to resolve, so it can feel slightly slower than a recent one.
