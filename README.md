# Andrew & Michelle — Summer Solstice Wedding 2026

A static wedding website hosted on GitHub Pages. Built with plain HTML, CSS, and JavaScript — no build step, no dependencies.

**Live site:** https://andrewmichellesummersolstice.github.io

Features include a live countdown to June 21, 2026, an engagement photo gallery (PhotoSwipe lightbox), a password-protected seating chart with name search over an interactive SVG floor plan, and a dark/light mode toggle (saved per browser, also respects system preference).

---

## Local Development

The site is fully static, so any HTTP server will work. Don't open the files directly with `file://` — the seating chart fetches `data/seating.json` and the browser will block that under the file protocol.

Pick whichever is convenient:

```bash
# Python 3 (Windows: use `py` instead of `python`)
python -m http.server 8000

# Node (no install needed)
npx serve -l 8000

# VS Code: install the "Live Server" extension and click "Go Live"
```

Then open <http://localhost:8000/>.

To edit, just change the HTML / CSS / JS files and refresh the browser — there's no build step or watcher. The CSS variables in `css/main.css` (`:root` block) define the color palette; the `[data-theme="dark"]` block below overrides them for dark mode.

---

## Pages

| Page | File | Description |
|---|---|---|
| Home | `index.html` | Hero, countdown timer, navigation cards |
| Our Story | `story.html` | Couple's story sections (fill in your text) |
| Schedule | `schedule.html` | Wedding day timeline |
| Photos | `photos.html` | Engagement gallery + vendor media placeholders |
| Seating Chart | `seating.html` | Password-protected name search + SVG floor plan |
| Vendors | `vendors.html` | Vendor credits + future photo/video links |

---

## How to Update Content

### Add Engagement Photos
1. Place images in `assets/images/` (e.g. `engagement-01.jpg`)
2. In `photos.html`, replace each `<div class="gallery-placeholder">` with `<img src="assets/images/engagement-01.jpg" alt="...">`
3. Update the `data-pswp-width` and `data-pswp-height` attributes on each `<a>` tag to match your image dimensions

### Update Seating Assignments
Edit `data/seating.json`. Each guest entry looks like:
```json
{ "id": 1, "name": "Jane Smith", "table": 3, "tableLabel": "Table 3", "side": "groom", "alias": "" }
```
- `alias` — a searchable nickname shown in parentheses (e.g. `"Grandma"`)
- `side` — `"groom"` or `"bride"`

### Add Vendor Links
In `vendors.html`, replace `href="#"` on each vendor card with the actual website URL.

### Add Wedding Gallery / Video (Post-Wedding)
In `vendors.html`, replace the `<span class="media-card__badge">Coming Soon</span>` elements with:
```html
<a href="YOUR_LINK_HERE" class="btn btn--gold" target="_blank" rel="noopener">View Gallery</a>
```

### Update the Story
In `story.html`, replace each `[placeholder]` paragraph with your real story text.

### Update Venue Details
In `schedule.html`, update the venue name, address, and directions link in the info cards.

---

## Seating Chart Password
The seating page is password-protected. Current password: **summer2026**

To change the password:
1. Run: `node -e "require('crypto').createHash('sha256').update('YOURPASSWORD').digest('hex')"`
2. Copy the output hash
3. In `js/auth.js`, replace the value of `EXPECTED_HASH`

---

## Deploying to GitHub Pages
1. Push all files to the `main` branch
2. In GitHub repo Settings → Pages → Source: select `main` branch, root folder
3. Site will be live at `https://andrewmichellesummersolstice.github.io`

---

## Project Structure
```
index.html          Home page
schedule.html       Wedding day timeline
story.html          Our story
photos.html         Photo gallery
seating.html        Seating chart (password protected)
vendors.html        Vendor credits & media links
css/
  main.css          CSS variables, typography, layout
  components.css    Nav, buttons, cards, timeline, gallery, modals
js/
  main.js           Navigation, scroll animations
  countdown.js      Countdown timer to June 21, 2026
  auth.js           Password protection (SHA-256)
  seating-search.js Fuzzy guest search + SVG interaction
data/
  seating.json      All guest seating assignments
assets/
  images/           Engagement photos (add your own)
```
