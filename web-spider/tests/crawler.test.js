import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeUrl,sameSite,excluded} from '../crawler/url-manager.js';
import {CrawlQueue} from '../crawler/queue.js';
import {extractPage} from '../crawler/extractor.js';

test('normalizes URLs and drops fragments and unsafe schemes',()=>{
  assert.equal(normalizeUrl('../about#team','https://example.com/a/'), 'https://example.com/about');
  assert.equal(normalizeUrl('javascript:alert(1)','https://example.com'), null);
});
test('same-site check and invalid patterns',()=>{
  assert.equal(sameSite('https://example.com/a','https://example.com/b'),true);
  assert.equal(sameSite('https://other.test','https://example.com'),false);
  assert.equal(excluded('https://example.com/private',['/private']),true);
  assert.equal(excluded('https://example.com/a',['[']),false);
});
test('queue deduplicates and prioritizes useful pages',()=>{
  const q=new CrawlQueue(); assert.equal(q.add('/a',1,1),true); assert.equal(q.add('/a',2,2),false); q.add('/b',1,5);
  assert.equal(q.next().url,'/b'); assert.equal(q.length,1);
});
test('extracts page metadata, content, and separates internal from external links',()=>{
  const el=(innerText,extra={})=>({innerText,...extra});
  const local={href:'https://example.com/contact',innerText:'Contact us',title:''};
  const remote={href:'https://outside.test/info',innerText:'Reference',title:'External'};
  const doc={title:'Example page',documentElement:{lang:'en'},body:el('Contact us at hello@example.com'),images:[{src:'https://example.com/p.png',alt:'Preview'}],
    querySelector(selector){if(selector.startsWith('meta[name="description"'))return {content:'A description'};if(selector.startsWith('meta[name="keywords"'))return {content:'one, two'};if(selector==='link[rel="canonical"]')return {href:'https://example.com/'};if(selector==='main,article,[role="main"]')return el('Useful page text');return null},
    querySelectorAll(selector){if(selector==='a[href]')return [local,remote];if(selector==='h1,h2,h3,h4,h5,h6')return [{tagName:'H1',innerText:'Welcome'}];if(selector==='p')return [el('A paragraph')];if(selector==='li')return [el('An item')];if(selector==='script[type="application/ld+json"]')return [];return []}};
  const page=extractPage(doc,'https://example.com/start');
  assert.equal(page.title,'Example page');assert.equal(page.description,'A description');assert.equal(page.mainText,'Useful page text');
  assert.equal(page.headings[0].text,'Welcome');assert.equal(page.internalLinks.length,1);assert.equal(page.externalLinks[0].url,remote.href);
  assert.equal(page.images[0].alt,'Preview');assert.deepEqual(page.emails,['hello@example.com']);
});
