export function extractPage(doc = document, locationHref = location.href) {
  const text = el => (el?.innerText || el?.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 12000);
  const meta = name => doc.querySelector(`meta[name="${name}" i]`)?.content?.trim() || '';
  const canonical = doc.querySelector('link[rel="canonical"]')?.href || '';
  const anchors = [...doc.querySelectorAll('a[href]')].map(a => ({url: a.href, text: text(a).slice(0,500), title: a.title || ''})).filter(a => /^https?:/.test(a.url));
  const images = [...doc.images].map(i => ({url: i.currentSrc || i.src, alt: i.alt || '', title: i.title || ''})).filter(i => i.url);
  const headings = [...doc.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h => ({level: Number(h.tagName[1]), text: text(h)})).filter(h => h.text);
  const paragraphs = [...doc.querySelectorAll('p')].map(text).filter(Boolean).slice(0,500);
  const lists = [...doc.querySelectorAll('li')].map(text).filter(Boolean).slice(0,500);
  const emails = [...new Set((doc.body?.innerText || '').match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [])];
  const internal = [], external = []; const host = new URL(locationHref).hostname;
  for (const a of anchors) (new URL(a.url).hostname === host ? internal : external).push(a);
  const structured = [...doc.querySelectorAll('script[type="application/ld+json"]')].map(s => s.textContent.slice(0,5000)).slice(0,50);
  return {url: locationHref, domain: new URL(locationHref).hostname, title: doc.title || '', description: meta('description'), keywords: meta('keywords'), canonical, language: doc.documentElement.lang || '', headings, paragraphs, mainText: text(doc.querySelector('main,article,[role="main"]') || doc.body).slice(0,30000), lists, internalLinks: internal, externalLinks: external, images, emails, structured, scannedAt: new Date().toISOString()};
}
