(() => {
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
  const list = (items, render, empty = 'Nothing collected.') => items?.length
    ? `<ul>${items.map(render).join('')}</ul>`
    : `<p class="empty">${empty}</p>`;

  function render(report) {
    const pageCards = report.pages.map((page, index) => {
      const title = page.title || 'Untitled page';
      const preview = page.description || page.paragraphs?.[0] || page.mainText || 'No readable summary was found.';
      const sections = page.sections?.length
        ? page.sections
        : [{ heading: 'Page text', level: 2, content: (page.paragraphs?.length ? page.paragraphs : [page.mainText || 'No readable page text found.']) }];
      const content = sections.map((section, sectionIndex) => `
        <details class="content-section" ${sectionIndex === 0 ? 'open' : ''}>
          <summary>${esc(section.heading || 'More content')}</summary>
          <div class="section-copy">${(section.content || []).map(text => `<p>${esc(text)}</p>`).join('') || '<p class="empty">No text in this section.</p>'}</div>
        </details>`).join('');
      const contacts = [
        ...(page.emails || []).map(email => `<li><a href="mailto:${esc(email)}">${esc(email)}</a></li>`),
        ...(page.phones || []).map(phone => `<li>${esc(phone)}</li>`),
        ...(page.addresses || []).map(address => `<li>${esc(address)}</li>`)
      ].join('');
      const searchText = [title, page.url, page.description, page.mainText, ...(page.headings || []).map(h => h.text)].join(' ').toLowerCase();
      return `
        <article class="page" id="page-${index + 1}" data-search="${esc(searchText)}">
          <div class="page-heading"><span class="number">${String(index + 1).padStart(2, '0')}</span><div><h2>${esc(title)}</h2><a class="url" href="${esc(page.url)}">${esc(page.url)}</a></div></div>
          <p class="preview">${esc(preview.slice(0, 360))}${preview.length > 360 ? '…' : ''}</p>
          <div class="chips"><span>${page.headings?.length || 0} headings</span><span>${page.paragraphs?.length || 0} text blocks</span><span>${page.internalLinks?.length || 0} site links</span><span>${page.images?.length || 0} images</span></div>
          <details class="read-more"><summary>Read page details</summary><div class="page-content">
            <h3>Page content</h3>${content}
            ${contacts ? `<h3>Contact information</h3><ul>${contacts}</ul>` : ''}
            <details class="sub"><summary>Headings (${page.headings?.length || 0})</summary>${list(page.headings, heading => `<li class="h${heading.level}">${esc(heading.text)}</li>`)}</details>
            <details class="sub"><summary>Links (${(page.internalLinks?.length || 0) + (page.externalLinks?.length || 0)})</summary><h4>On this website</h4>${list(page.internalLinks, link => `<li><a href="${esc(link.url)}">${esc(link.text || link.url)}</a></li>`, 'No internal links found.')}<h4>Other websites</h4>${list(page.externalLinks, link => `<li><a href="${esc(link.url)}">${esc(link.text || link.url)}</a></li>`, 'No external links found.')}</details>
            <details class="sub"><summary>Images (${page.images?.length || 0})</summary>${list(page.images, image => `<li><a href="${esc(image.url)}">${esc(image.alt || image.title || 'Open image')}</a>${image.alt ? `<span class="muted"> — ${esc(image.alt)}</span>` : ''}</li>`, 'No images found.')}</details>
            ${page.tables?.length ? `<details class="sub"><summary>Tables (${page.tables.length})</summary>${page.tables.map((rows, i) => `<section class="table-block"><h4>Table ${i + 1}</h4>${list(rows, row => `<li>${esc(row)}</li>`)}</section>`).join('')}</details>` : ''}
            <details class="sub"><summary>Page information</summary><dl><dt>Description</dt><dd>${esc(page.description || 'Not provided')}</dd><dt>Author</dt><dd>${esc(page.author || 'Not provided')}</dd><dt>Published</dt><dd>${esc(page.published || 'Not provided')}</dd><dt>Canonical URL</dt><dd>${page.canonical ? `<a href="${esc(page.canonical)}">${esc(page.canonical)}</a>` : 'Not set'}</dd><dt>Language</dt><dd>${esc(page.language || 'Not set')}</dd><dt>Keywords</dt><dd>${esc(page.keywords || 'Not set')}</dd><dt>Scanned</dt><dd>${esc(page.scannedAt || 'Unknown')}</dd></dl>${page.structured?.length ? `<details class="sub"><summary>Structured data</summary><pre>${esc(JSON.stringify(page.structured, null, 2))}</pre></details>` : ''}</details>
          </div></details>
        </article>`;
    }).join('');
    const index = report.pages.map((page, i) => `<li><a href="#page-${i + 1}">${esc(page.title || 'Untitled page')}</a><span>${esc(new URL(page.url).pathname || '/')}</span></li>`).join('');
    const stats = [['Pages scanned', report.statistics.scanned], ['Pages discovered', report.statistics.discovered], ['Links collected', report.statistics.links], ['Images collected', report.statistics.images], ['Errors', report.statistics.errors]];
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>WEB SPIDER — ${esc(report.website)}</title><style>
      :root{color-scheme:dark;--bg:#0a0d13;--panel:#121823;--line:#293241;--text:#e9edf5;--muted:#9ca8b9;--pink:#ff2e88;--green:#39ff88;--blue:#70baff;--yellow:#ffdf73}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--text);font:15px/1.7 system-ui,Segoe UI,sans-serif}header{padding:38px max(5vw,22px);background:linear-gradient(115deg,#221321,#10221c);border-bottom:1px solid var(--line)}header .eyebrow{color:var(--green);font-size:12px;font-weight:700;letter-spacing:.16em}h1{margin:4px 0;color:var(--pink);font-size:clamp(26px,4vw,42px);letter-spacing:.04em}header p{margin:4px 0;color:#bdc5d2}main{max-width:1080px;margin:28px auto;padding:0 20px}.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px}.stat,.panel,.page{background:var(--panel);border:1px solid var(--line);border-radius:14px}.stat{padding:14px}.stat b{display:block;color:var(--green);font-size:24px}.stat span,.muted{color:var(--muted);font-size:13px}.panel{padding:16px;margin:18px 0}.panel h2{margin:0 0 8px;font-size:17px;color:var(--yellow)}.index{columns:2;column-gap:32px;padding-left:22px}.index li{break-inside:avoid;margin:5px 0}.index li span{display:block;color:var(--muted);font-size:12px;overflow-wrap:anywhere}.tools{display:flex;gap:12px;align-items:center;margin:24px 0}.tools input{flex:1;min-width:100px;padding:12px;background:var(--panel);color:white;border:1px solid #394456;border-radius:9px;font:inherit}.tools span{color:var(--muted);font-size:13px}.page{padding:18px;margin:14px 0;scroll-margin-top:14px}.page-heading{display:flex;gap:12px;align-items:flex-start}.number{color:var(--pink);font-variant-numeric:tabular-nums;font-weight:700;padding-top:4px}.page h2{margin:0;font-size:20px;color:var(--yellow);line-height:1.35}.url{display:block;margin-top:5px;overflow-wrap:anywhere;font-size:13px}.preview{margin:14px 0;color:#d4dbe6}.chips{display:flex;gap:7px;flex-wrap:wrap;margin:12px 0}.chips span{padding:2px 9px;border:1px solid #353e4d;border-radius:99px;color:#b4bfce;font-size:12px}.read-more,.sub,.content-section{border:1px solid #293241;border-radius:9px}.read-more>summary,.sub>summary,.content-section>summary{padding:9px 12px;color:var(--blue);font-weight:650;cursor:pointer}.page-content{padding:4px 12px 12px}.page-content h3{margin:20px 0 8px;color:var(--green);font-size:16px}.content-section{margin:8px 0;background:#0e141d}.content-section>summary{color:#dce4ef}.section-copy{padding:0 14px 8px}.section-copy p{padding-bottom:10px;border-bottom:1px solid #202937}.section-copy p:last-child{border:0}.sub{margin:10px 0;padding:4px 10px}.sub>summary{color:#bdc6d6}p{margin:8px 0 12px;white-space:pre-wrap;overflow-wrap:anywhere}ul,ol{padding-left:23px}li{margin:4px 0;overflow-wrap:anywhere}a{color:var(--blue)}a:hover{color:#b7ddff}.h2{margin-left:12px}.h3{margin-left:24px}.h4,.h5,.h6{margin-left:36px}dl{display:grid;grid-template-columns:minmax(120px,180px) 1fr;gap:6px}dt{color:var(--muted)}dd{margin:0;overflow-wrap:anywhere}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#0a0d13;padding:12px;border-radius:8px}.empty{color:var(--muted);font-style:italic}.table-block{padding:0 12px}.errors{padding:14px;background:#21151a;border:1px solid #542c3a;border-radius:10px}footer{margin:36px 0;color:#7f8899;font-size:12px}@media(max-width:650px){.index{columns:1}.tools{align-items:stretch;flex-direction:column}dl{grid-template-columns:1fr}}@media print{body{background:white;color:#111}header{background:white;border-color:#ddd}h1,h3,a{color:#111}.page,.stat,.panel{break-inside:avoid;background:white;color:#111;border-color:#ccc}.tools{display:none}}
    </style></head><body><header><div class="eyebrow">LOCAL WEBSITE RESEARCH</div><h1>${esc(report.website)}</h1><p>${report.pages.length} pages scanned · created ${esc(report.createdAt)}</p><p>Started from <a href="${esc(report.startedFrom)}">${esc(report.startedFrom)}</a></p></header><main>
      <section class="stats">${stats.map(([label, value]) => `<div class="stat"><b>${Number(value) || 0}</b><span>${esc(label)}</span></div>`).join('')}</section>
      <section class="panel"><h2>Pages in this report</h2><ol class="index">${index || '<li>No pages were scanned.</li>'}</ol></section>
      <div class="tools"><input id="search" type="search" placeholder="Search titles and collected text"><span>${esc(report.configuration.mode || 'current')} crawl · expand a page for details</span></div>
      <section id="pages">${pageCards || '<p class="empty">No pages collected.</p>'}</section>
      ${report.errors?.length ? `<section class="panel errors"><h2>Pages that could not be scanned</h2>${list(report.errors, error => `<li><a href="${esc(error.url)}">${esc(error.url)}</a><br><span class="muted">${esc(error.error)}</span></li>`)}</section>` : ''}
      ${report.discoveredUnvisited?.length ? `<details class="panel"><summary>Discovered but not visited (${report.discoveredUnvisited.length})</summary>${list(report.discoveredUnvisited, url => `<li><a href="${esc(url)}">${esc(url)}</a></li>`)}</details>` : ''}
      <footer>Generated locally by WEB SPIDER from pages visited during this crawl.</footer></main><script>document.querySelector('#search').addEventListener('input',e=>{const q=e.target.value.trim().toLowerCase();document.querySelectorAll('.page').forEach(page=>{page.hidden=q&&!page.dataset.search.includes(q)})})</script></body></html>`;
  }
  globalThis.WebSpiderHtml = Object.freeze({ render });
})();
