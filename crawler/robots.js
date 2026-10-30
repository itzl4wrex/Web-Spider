export async function allowedByRobots(url) {
  try {
    const u = new URL(url), response = await fetch(`${u.origin}/robots.txt`, {signal: AbortSignal.timeout(5000)});
    if (!response.ok) return {allowed: true, note: `robots.txt returned ${response.status}; proceeding`};
    const rules = (await response.text()).split(/\r?\n/); let applies = false, directives = [];
    for (const line of rules) { const [key,...rest] = line.split(':'); if (!key) continue; const k=key.trim().toLowerCase(), v=rest.join(':').trim();
      if (k==='user-agent') { if (applies && directives.length) break; applies = v==='*'; if (applies) directives=[]; }
      else if (applies && (k==='disallow'||k==='allow') && v) directives.push({k,v});
    }
    const path = u.pathname + u.search, match = directives.filter(r => path.startsWith(r.v)).sort((a,b)=>b.v.length-a.v.length)[0];
    return {allowed: match?.k !== 'disallow', note: match ? `${match.k} ${match.v}` : 'robots.txt allows this path'};
  } catch (e) { return {allowed: true, note: `robots.txt unavailable (${e.message}); proceeding`}; }
}
