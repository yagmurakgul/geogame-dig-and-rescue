# Dig & Rescue — A Geography Adventure

A browser-based GeoGame developed by **Yağmur Akgül** for **GMT458 — Web GIS**, Hacettepe University.

[Play the game](https://yagmurakgul.github.io/geogame-dig-and-rescue/)

## Story and characters

![The original prince and princess](assets/characters/characters.png)

Follow a prince through underground passages to rescue a princess. Geographical notes reveal her country, while unexpected surface visits challenge the player to identify other countries. The castle window displays the princess from the original character artwork, not an emoji. Opening and ending MP4 sequences tell the story.

## Functional requirements

- Navigate a 12-column by 9-row local grid using cardinal directions and cell addresses. Each cell represents 10 × 10 metres in the fictional excavation plan.
- Dig soil with three individual shovel hits; use earned bombs to clear a 3 × 3 area.
- Collect underground geographical notes by walking onto revealed note tiles. Bombs reveal notes without destroying them.
- Identify countries by selecting real GeoJSON polygons on a pan-and-zoom world map.
- Recognise landmarks from lightly blurred photographs; only a correct answer removes the blur.
- Apply a 60-second time limit, scoring, three final guesses and persistent local high scores.
- Support keyboard controls and on-screen buttons, with skippable opening and ending videos.

## Frontend design

![Proposed interface layouts](docs/layout.svg)

The excavation screen contains the direction note, position, score, tool inventory, grid and clue notebook. Surface visits first show a photograph or the castle. A button opens the world map; the timer and score remain visible above both views. The result screen reports the score and offers a new game.

## Progression, tasks and lives

Each game chooses its final visit randomly from **3, 4 or 5**. Thus there are **3–5 excavation tasks and 3–5 country-identification stages**, with Italy always last. The preceding 2–4 destinations come from a ten-country landmark pool. A shuffled queue stored locally reduces repetition between games. The final location stays fixed in this version, so experienced players may recognise it early.

Four unique Italy clues concern Europe/the Mediterranean, the boot-shaped mainland, the Alps, and Sicily/Sardinia. Up to two uncollected notes are placed per excavation; a player can miss optional notes. Each excavation randomises both its starting room and buried portal. Routes span 7–12 cells (Manhattan distance), with at least two cells along each axis. The horizontal/vertical order also varies. Relative route instructions do not repeat within a game, and the immediately previous route is excluded across reloads when storage is available. These instructions describe a suggested path; players may dig an alternative route. The challenge changes from landmark recognition to combining collected clues; this version does not claim increasingly difficult generated levels.

Normal surface stages allow **one submitted guess** and have no life penalty: an incorrect answer or timeout ends that stage without reward. The final stage allows **three guesses within one shared 60-second limit**. Three wrong guesses or expiry end the adventure. A correct final answer rescues the princess and plays the ending video.

## Time and scoring

The timer starts only when the player first opens a successfully loaded map for that visit. Initial photographs, excavation, network loading and cinematics are untimed. Returning to a photograph does not reset or pause the timer. Switching tabs also does not pause it; elapsed time is checked against a monotonic deadline, including immediately before accepting an answer.

| Result | Reward |
|---|---|
| Correct normal country | 100 + 2 × remaining whole displayed seconds; one bomb |
| Wrong normal guess or timeout | No points or bomb; continue digging |
| Correct final country | 300 + 2 × remaining whole displayed seconds; rescue |
| Final failure | Game ends with the points already earned |

Scores are non-negative. The displayed seconds use ceiling rounding, so a correct normal stage can award up to 220 points and the final up to 420. Local records are saved when the game ends, separately for 3-, 4- and 5-visit campaigns. These are browser-local scores, not a global or tamper-proof leaderboard. If browser storage is unavailable, gameplay continues without persistent records.

## Controls

| Input | Action |
|---|---|
| Arrow keys / WASD | Face or move in a cardinal direction |
| Space / action button | Use the selected tool |
| 1 / 2 | Select shovel / bomb |
| Tap adjacent cell | Dig, move or place the selected bomb |
| Tap distant cell | Mark a target |
| Drag map / + and − | Pan / zoom |
| Video buttons / Escape | Play, mute or skip a cinematic |

## Technologies, libraries and open data

The implementation uses plain **HTML, CSS and JavaScript**, Canvas 2D, DOM APIs, Pointer Events, Web Audio, HTML video and localStorage. **No third-party JavaScript library is currently required.** Canvas is a browser API, not a library. Leaflet, OpenLayers and advanced visualisation libraries are not claimed as dependencies or bonus features.

Country boundaries are loaded from the local `assets/countries.geojson`, using Natural Earth boundaries distributed through [datasets/geo-countries](https://github.com/datasets/geo-countries). [Natural Earth](https://www.naturalearthdata.com/about/terms-of-use/) provides public-domain geographical data. The map uses a simple equirectangular projection; the fictional digging grid is not a real underground route between countries. Polygon hit-testing uses Canvas `isPointInPath` with the even-odd fill rule.

Landmark photographs and character/video artwork are separate game assets; they are not part of the boundary dataset. Photo source and licence credits should be completed using the original download sources before final submission.

## Three implemented event handlers

1. **`keydown` in `game.js`:** interprets movement keys and Space, updates the player's direction or invokes the selected tool. Form controls are excluded from gameplay shortcuts.
2. **`pointerup` in `surface.js`:** distinguishes a map tap from a drag, transforms screen coordinates into map coordinates and selects the polygon containing the point.
3. **`click` on `confirmCountry` in `surface.js`:** checks the time deadline, compares the selected ISO3 country code with the answer, awards points/bombs or subtracts a final guess, and opens the appropriate result.

Custom `geogame:surface`, `geogame:return-to-dig`, `geogame:score` and `geogame:ending` events connect the separate scripts. The video's `ended` event returns control to the game.

## Closures

Each script uses an immediately invoked function expression (IIFE). Event callbacks retain access to that function's lexical scope after initialisation returns. For example, the confirmation callback can read and update `selectedCountry`, `score`, `lives` and `answered` without exposing them as global variables. `setInterval(checkTime, 100)` retains access to the private `deadline`, while cinematic callbacks retain `active`, `endingShown` and `playbackId`. The small shared inventory is deliberately exposed for communication with digging mechanics.

## DOM interaction

`getElementById` and `querySelector` locate controls. `createElement` and `appendChild` construct surface scenes, the HUD and notebook entries. `textContent` updates messages, counters and clue text; `hidden` switches between scenes; `classList` changes blur and low-time styling. `addEventListener` connects user actions to state changes. Canvas draws the excavation and map within DOM canvas elements. Static templates use `innerHTML`; clue text is copied with `textContent`.

## What I learned from AI

ChatGPT assisted with planning, code examples and debugging. Through this work I learned how event handlers connect input to game state, how closures keep state private, how the DOM updates interface elements, and why coordinate conversion is needed for map hit-testing. I also learned to handle video autoplay restrictions, asynchronous data loading and timer deadlines, and to document implemented features separately from planned work. I selected the story, supplied the assets and reviewed the proposed changes.

**AI interaction URL:** TODO — insert the actual shared ChatGPT conversation link before submission. This placeholder is not a submitted reference.

## Run and publish

Keep `index.html`, `style.css`, `game.js`, `surface.js` and `cinematics.js` at the repository root. Retain the existing `assets` directory:

- `assets/characters/characters.png` — combined artwork, prince left / princess right.
- `assets/countries.geojson` — country polygons with ISO3166-1-Alpha-3 properties.
- `assets/landmarks/` — athens.jpg, türkiye.jpg, china.jpg, barcelona.jpg, usa.jpg, peru.jpg, french.jpg, england.jpg, india.jpg, australia.jpg.
- `assets/videos/intro.mp4` and `assets/videos/ending.mp4` — normal-speed videos with original sound.

Serve locally with VS Code Live Server or `python3 -m http.server 8000`; open http://localhost:8000. Do not rely on opening index.html via file:// because the map is fetched. Publish the main branch root through GitHub Pages. Preserve real development history with meaningful commits; do not fabricate past commits.

## Further development

Additional final countries, more varied clues and levels, collectibles, improved character movement and further accessibility work are planned. A five-diamond proposal scene is not implemented in this version. Broad Safari, Firefox and mobile device testing remains part of the final review.

## Submission checklist

- Confirm the live Pages URL and register the repository in the course peer-review system.
- Replace the AI interaction URL placeholder with the real shared conversation link.
- Complete original photo credits and test the actual image, GeoJSON and video assets online.
- Review the documented rules against the deployed build and retain regular Git commits.


### Interface languages

Use the persistent **Türkçe / English** selector at the top of the screen. Rules, clues, route instructions, map labels, feedback, results and video controls switch without restarting the game or pausing its timer. The preference is saved locally when browser storage is available. `i18n.js` must load before the game scripts. It translates text and accessible labels while preserving the existing DOM controls and gameplay state. Map names use `Intl.DisplayNames` with dataset names as a fallback. Existing MP4 audio and embedded text are not translated.

Player-facing instructions do not reveal the destination or the final portal number.
