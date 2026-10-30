import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../exporter/html-template.js', import.meta.url), 'utf8');
const context = vm.createContext({ URL });
vm.runInContext(source, context);

test('builds a scannable report with a page index and concise previews', () => {
  const html = context.WebSpiderHtml.render({
    website: 'example.test', createdAt: 'today', startedFrom: 'https://example.test/',
    configuration: { mode: 'deep' }, statistics: { scanned: 1, discovered: 3, links: 4, images: 2, errors: 0 },
    pages: [{
      url: 'https://example.test/about', title: 'About', description: 'A short page summary.',
      paragraphs: ['A useful first paragraph.', 'More detail.'], mainText: 'A useful first paragraph. More detail.',
      headings: [{ level: 1, text: 'About us' }], sections: [{ heading: 'Our work', content: ['We make useful things.'] }],
      internalLinks: [], externalLinks: [], images: [], emails: [], phones: [], addresses: [], tables: [], structured: []
    }], errors: [], discoveredUnvisited: []
  });

  assert.match(html, /Pages in this report/);
  assert.match(html, /A short page summary/);
  assert.match(html, /Read page details/);
  assert.match(html, /Our work/);
  assert.match(html, /placeholder="Search titles and collected text"/);
});

test('escapes collected page data before placing it in report markup', () => {
  const html = context.WebSpiderHtml.render({
    website: '<img src=x onerror=alert(1)>', createdAt: '', startedFrom: 'https://example.test/',
    configuration: {}, statistics: {},
    pages: [{ url: 'https://example.test/', title: '<script>alert(1)</script>', description: 'safe',
      paragraphs: [], mainText: '', headings: [], sections: [], internalLinks: [], externalLinks: [], images: [],
      emails: [], phones: [], addresses: [], tables: [], structured: [] }], errors: [], discoveredUnvisited: []
  });

  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
});
