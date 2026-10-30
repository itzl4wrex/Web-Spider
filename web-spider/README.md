# WEB SPIDER

WEB SPIDER is a lightweight Chrome/Edge Manifest V3 extension that explores the current HTTP(S) site, extracts visible page information, and saves standalone HTML, JSON, and text reports into Downloads.

## Install

1. Unzip or keep the `web-spider` folder in a permanent location.
2. Open `chrome://extensions` in Chrome or `edge://extensions` in Edge.
3. Enable **Developer mode**.
4. Choose **Load unpacked** and select this folder.
5. Open a regular website, select the WEB SPIDER toolbar button, configure the crawl, and press **START**.

## Use

- **Current page** inspects only the tab you started from.
- **Internal crawl** follows same-host links one level deep.
- **Deep crawl** follows same-host links recursively, respecting page and depth limits.
- Pause and Resume preserve the current in-memory queue. Stop closes the extension's current background visit tab.
- When a crawl finishes, reports are downloaded automatically. **EXPORT** downloads the current results again.
- The spider canvas is independent from extraction. Toggle it off to save CPU; mouse-follow steers the spider to the pointer. Autonomous exploration selects visible headings, links, images, and buttons.
- Include/exclude fields accept JavaScript regular expressions, one per line. Empty include means all eligible same-host links.

## Permissions

The extension requests `activeTab`, `tabs`, and `scripting` to inspect the current tab and open/inspect background visit tabs; `storage` for live crawl state; `downloads` to create reports. HTTP and HTTPS host access is declared so the service worker can visit same-site URLs and retrieve that host's `robots.txt`. Chrome Web Store review should evaluate the broad host access for the cross-page crawler use case. It does not use a server, third-party API, or external library.

## Crawl behavior and limits

Only HTTP and HTTPS URLs on the starting origin are scheduled. Fragments are removed, links are deduplicated, and a per-page delay is enforced (at least one second). Before visits the crawler requests `/robots.txt`; an explicit matching disallow prevents a visit. If robots.txt cannot be retrieved, the crawl proceeds and the activity log explains why. The parser implements common wildcard-agent allow/disallow rules, not the complete robots exclusion standard.

Pages are extracted by injecting a content script into a background tab. Failed navigation, redirects off the starting host, and extraction errors are listed as errors; discovered queued links remain identified as unvisited. The crawler does not bypass login, CAPTCHA, paywalls, or other access restrictions. It cannot inspect browser-internal pages, downloads, or pages blocked by the browser or site. Respect website terms and crawl only sites you are authorized to access.

The wireframe spider takes its visual cues from [the WEB Crawler reference](https://fredfokan.github.io/web-crawler/): articulated alternating legs, a compact neon robot body, glowing tether, target highlights, and small scan sparks. Mouse-follow is enabled by default; the spider eases toward the pointer with acceleration and body rotation. Autonomous mode steers it between visible links and headings when mouse-follow is turned off. The overlay uses `pointer-events:none` and does not change page content.

The crawler reads the current tab directly first, then opens and closes background tabs for additional pages. The popup shows a live preview of the most recently collected title, description, headings, links, images, and text. A 30 FPS capped `requestAnimationFrame` loop suspends drawing while the tab is hidden. Browser popup/service-worker lifetimes can interrupt an active crawl; this initial version does not provide durable crash recovery.

## Development checks

Run `npm test` from this directory for URL normalization, same-site filtering, duplicate prevention, and queue prioritization tests. Chromium extension APIs require loading the unpacked folder in a browser for end-to-end use. No browser automation runtime is bundled with this project.
