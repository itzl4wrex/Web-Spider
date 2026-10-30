export function normalizeUrl(value, base) {
  try {
    const u = new URL(value, base); if (!/^https?:$/.test(u.protocol)) return null;
    u.hash = ''; u.username = ''; u.password = ''; return u.href;
  } catch { return null; }
}
export function sameSite(a, b) { try { return new URL(a).hostname.toLowerCase() === new URL(b).hostname.toLowerCase(); } catch { return false; } }
export function excluded(url, patterns = []) { return patterns.some(p => { try { return new RegExp(p, 'i').test(url); } catch { return false; } }); }
