# WEB SPIDER

WEB SPIDER is a lightweight Chrome/Edge Manifest V3 extension that crawls the current HTTP(S) site, organizes useful page content, and writes one searchable HTML report named `WEB SPIDER.html` when you press **EXPORT**.

## Install

1. Open `chrome://extensions` in Chrome or `edge://extensions` in Edge.
2. Turn on **Developer mode** and choose **Load unpacked**.
3. Select this `web-spider` folder.
4. Open a website and press **START** in the WEB SPIDER popup.

The extension toolbar and popup use the custom neon spider icon. The popup groups crawl setup, spider behavior, live totals, and activity so the main controls are quick to find.

## Crawl controls

- **Deep crawl** is the default. It recursively follows same-origin links.
- **Internal crawl** follows links one level deep. **Current page** scans only the open tab.
- Page and depth values of `0` mean unlimited. The deep crawl stays active after its link queue empties and checks the starting page for new links.
- **EXPORT** stops the crawl and saves the collected pages to one `WEB SPIDER.html` file. Re-export overwrites that file. Closing or navigating the starting tab stops collection without downloading.
- **PAUSE** freezes the spider in place and stops page collection; **RESUME** continues from the queued page. **STOP** ends collection. **DELETE COLLECTED DATA** clears saved crawl results. Exclude/include fields accept JavaScript regular expressions, one per line.

The report opens with scan totals and a page index. Each page shows its title, URL, and a short preview; expand **Read page details** for content grouped by headings, then open headings, links, images, tables, and metadata as needed. The report is searchable and includes contact details, errors, and discovered-but-unvisited URLs. Short stray text and common navigation elements are filtered out. Full page results are kept in local IndexedDB until deletion or the next crawl.

## Spider behavior

The wireframe animation takes visual cues from [the WEB Crawler reference](https://fredfokan.github.io/web-crawler/). The spider stays dormant when the popup opens and appears only after **START**. Mouse-follow is enabled by default. Turning it off lets the spider choose targets across the full document, smoothly scroll off-screen targets into view, and keep walking between links, headings, and images. The legs walk in alternating pairs and lift as the body moves. Animation runs independently from collection, recovers its animation loop after a drawing error, and uses a pointer-transparent Canvas overlay. Re-injection replaces the previous renderer so extension reloads do not stack multiple spiders.

## Permissions and crawl limits

The extension uses `activeTab`, `tabs`, and `scripting` to inspect the open page and visit discovered pages; `storage` for settings and live status; `downloads` to save the report; and `alarms` to resume a long crawl if the Manifest V3 worker sleeps. HTTP/HTTPS host access allows same-origin visits and `robots.txt` checks. The crawler stays on the starting origin, removes URL fragments, deduplicates links, and enforces at least a one-second delay. An explicit robots disallow is respected. It does not bypass login, CAPTCHAs, paywalls, or other access controls.

## Development checks

Run `npm test` for URL, queue, and extraction tests. JavaScript syntax can be checked with `node --check`. Load the unpacked folder in Chrome or Edge for browser-level verification.
