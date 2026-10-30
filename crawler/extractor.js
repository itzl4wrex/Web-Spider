const NOISE='nav,header,footer,aside,[role="navigation"],[role="contentinfo"],form,script,style,noscript,[aria-hidden="true"]';
const CONTENT='h1,h2,h3,h4,h5,h6,p,li,blockquote,pre,td,tr,address';
const clean=value=>(value||'').trim().replace(/\s+/g,' ');

export function extractPage(doc=document,locationHref=location.href){
  const meta=name=>doc.querySelector(`meta[name="${name}" i]`)?.content?.trim()||'';
  const candidates=[...doc.querySelectorAll('main,article,[role="main"]')].sort((a,b)=>(b.innerText||'').length-(a.innerText||'').length);
  const root=candidates[0]&&(candidates[0].innerText||'').length>160?candidates[0]:doc.body;
  const blocks=[...root.querySelectorAll(CONTENT)].filter(el=>!el.closest(NOISE)).map(el=>({tag:el.tagName,text:clean(el.innerText||el.textContent)})).filter(block=>{
    const words=block.text.split(/\s+/).filter(Boolean).length;
    return /^H[1-6]$/.test(block.tag)?words>0:block.tag==='LI'?words>=4||block.text.length>=28:words>=5||block.text.length>=40;
  }).filter((block,index,all)=>all.findIndex(item=>item.text===block.text)===index).slice(0,1200);
  const sections=[];let section={heading:'Overview',level:0,content:[]};
  for(const block of blocks){if(/^H[1-6]$/.test(block.tag)){if(section.content.length||section.heading!=='Overview')sections.push(section);section={heading:block.text,level:Number(block.tag[1]),content:[]}}else section.content.push(block.text)}
  if(section.content.length||!sections.length)sections.push(section);
  const anchors=[...doc.querySelectorAll('a[href]')].map(a=>({url:a.href,text:clean(a.innerText||a.textContent).slice(0,500),title:a.title||''})).filter(a=>/^https?:/.test(a.url));
  const host=new URL(locationHref).hostname,internalLinks=[],externalLinks=[];
  for(const anchor of anchors)(new URL(anchor.url).hostname===host?internalLinks:externalLinks).push(anchor);
  const bodyText=doc.body?.innerText||'',emails=[...new Set(bodyText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)||[])];
  const phones=[...new Set(bodyText.match(/(?:\+?\d[\d ().-]{7,}\d)/g)||[])].slice(0,30);
  const headings=blocks.filter(block=>/^H[1-6]$/.test(block.tag)).map(block=>({level:Number(block.tag[1]),text:block.text}));
  const paragraphs=blocks.filter(block=>['P','BLOCKQUOTE','PRE','TD','TR','ADDRESS'].includes(block.tag)).map(block=>block.text);
  const lists=blocks.filter(block=>block.tag==='LI').map(block=>block.text);
  const structured=[...doc.querySelectorAll('script[type="application/ld+json"]')].map(script=>{try{return JSON.parse(script.textContent)}catch{return script.textContent.slice(0,4000)}}).slice(0,20);
  return {url:locationHref,domain:host,title:doc.title||'',description:meta('description'),keywords:meta('keywords'),canonical:doc.querySelector('link[rel="canonical"]')?.href||'',language:doc.documentElement.lang||'',headings,sections,paragraphs,mainText:blocks.map(block=>block.text).join('\n\n').slice(0,50000),lists,internalLinks:internalLinks.slice(0,500),externalLinks:externalLinks.slice(0,300),images:[...doc.images].map(image=>({url:image.currentSrc||image.src,alt:image.alt||'',title:image.title||''})).filter(image=>image.url).slice(0,300),emails,phones,structured,scannedAt:new Date().toISOString()};
}
