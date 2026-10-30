export class CrawlQueue {
  constructor() { this.items = []; this.seen = new Set(); }
  add(url, depth = 0, score = 0) { if (this.seen.has(url)) return false; this.seen.add(url); this.items.push({url, depth, score}); this.items.sort((a,b) => b.score-a.score); return true; }
  next() { return this.items.shift() || null; }
  get length() { return this.items.length; }
}
