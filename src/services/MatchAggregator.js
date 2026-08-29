// ─── Fuzzy Match Helpers ────────────────────────────────────────────────────

/**
 * Normalizes team/event names by collapsing well-known multi-word clubs and
 * popular abbreviations into single collision-safe compound tokens so that
 * Jaccard / subset matching cannot accidentally merge different teams that share
 * a single word (e.g. "Inter Milan" vs "AC Milan" both contain "milan").
 */
function _compoundify(t) {
  const aliases = [
    // Football (Soccer)
    [/\bman(chester)?\s*utd\b|\bmanchester\s*united\b/g, 'manchesterunited'],
    [/\bman(chester)?\s*city\b/g, 'manchestercity'],
    [/\bspurs\b|\btottenham(\s*hotspur)?\b/g, 'tottenham'],
    [/\bwolves\b|\bwolverhampton(\s*wanderers)?\b/g, 'wolverhampton'],
    [/\bpsg\b|\bparis\s*(saint|st)\s*germain\b/g, 'psg'],
    [/\bbayern(\s*m[uü]nchen)?\b|\bbayern\s*munich\b/g, 'bayernmunich'],
    [/\batl(etico)?\s*madrid\b/g, 'atleticomadrid'],
    [/\breal\s*madrid\b|\br\s*madrid\b/g, 'realmadrid'],
    [/\binter(\s*milan)?\b|\binternazionale\b/g, 'intermilan'],
    [/\bac\s*milan\b/g, 'acmilan'],
    [/\bborussia\s*dortmund\b|\bbvb\b|\bdortmund\b/g, 'borussiadortmund'],
    [/\brb\s*leipzig\b/g, 'rbleipzig'],
    [/\baston\s*villa\b/g, 'astonvilla'],
    [/\bwest\s*ham(\s*united)?\b/g, 'westham'],
    [/\bcrystal\s*palace\b/g, 'crystalpalace'],
    [/\bnewcastle(\s*united)?\b/g, 'newcastle'],
    [/\bnottingham\s*forest\b/g, 'nottinghamforest'],
    [/\bnott(?:s)?\s*forest\b/g, 'nottinghamforest'],
    [/\bleicester(\s*city)?\b/g, 'leicestercity'],
    [/\bsheff(?:ield)?\s*(?:utd|united)\b/g, 'sheffieldunited'],
    [/\bbe(?:in\s*sport|\s*in)\b/g, 'beinsport'],
    [/\bal[\s\-]nassr\b/g, 'alnassr'],
    [/\bal[\s\-]hilal\b/g, 'alhilal'],
    [/\bal[\s\-]ahly\b/g, 'alahly'],
    [/\bboca\s*juniors\b|\bca\s*boca\b/g, 'bocajuniors'],
    // American Football
    [/\bkansas\s*city\s*chiefs\b|\bkc\s*chiefs\b|\bchiefs\b/g, 'kansascitychiefs'],
    [/\bseattle\s*seahawks\b|\bseahawks\b/g, 'seattleseahawks'],
    [/\bsan\s*francisco\s*49ers\b|\bniners\b|\b49ers\b/g, 'sf49ers'],
    [/\bdallas\s*cowboys\b|\bcowboys\b/g, 'dallascowboys'],
    [/\bphiladelphia\s*eagles\b|\beagles\b/g, 'philadelphiaeagles'],
    [/\bgreen\s*bay\s*packers\b|\bpackers\b/g, 'greenbaypacker'],
    [/\bcincinatti\s*bengals\b|\bbengals\b/g, 'cincinnatibengals'],
    [/\bpittsburgh\s*steelers\b|\bsteelers\b/g, 'pittsburghsteelers'],
    // Basketball
    [/\bny\s*knicks\b|\bnew\s*york\s*knicks\b|\bknicks\b/g, 'nyknicks'],
    [/\bboston\s*celtics\b|\bceltics\b/g, 'bostonceltics'],
    [/\bla\s*lakers\b|\blakers\b|\blos\s*angeles\s*lakers\b/g, 'lalakers'],
    [/\bgolden\s*state\s*warriors\b|\bwarriors\b/g, 'gswarriors'],
    [/\bchicago\s*bulls\b|\bbulls\b/g, 'chicagobulls'],
    [/\bmiami\s*heat\b|\bheat\b/g, 'miamiheat'],
    [/\bdenver\s*nuggets\b|\bnuggets\b/g, 'denvernuggets'],
    [/\bmilwaukee\s*bucks\b|\bbucks\b/g, 'milwaukeebucks'],
  ];
  let r = t.toLowerCase();
  for (const [regex, rep] of aliases) r = r.replace(regex, rep);
  return r;
}

function _stripNoise(t) {
  return t
    .replace(/\([^)]*\)/g, ' ').replace(/\[[^\]]*\]/g, ' ')
    .replace(/\b(live|stream|streaming|free|hd|fhd|4k|hq|web|online|tv|match|fixture|round|week|day|game|league|cup|tournament|season|fc|cf|sc|cd|ca|afc|fk|sk|bk|rsc|vfb|tsv)\b/gi, ' ');
}

function _tokenize(t) {
  return t.replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(w => w.length > 2);
}

/**
 * Determine if two team-name strings refer to the same club.
 * Single compound tokens (e.g. "manchestercity") require exact equality so
 * different compounds cannot accidentally match via substring.
 */
function _teamsSimilar(a, b) {
  if (!a || !b) return false;
  if (a === b) return true;
  const at = a.split(' ').filter(w => w.length > 2);
  const bt = b.split(' ').filter(w => w.length > 2);
  if (at.length === 0 || bt.length === 0) return false;
  if (at.length === 1 && bt.length === 1) return at[0] === bt[0];
  const sa = new Set(at), sb = new Set(bt);
  let common = 0;
  for (const w of sa) if (sb.has(w)) common++;
  const minLen = Math.min(sa.size, sb.size);
  return minLen > 0 && (common / minLen) >= 0.7;
}

/**
 * Try to split a match title into [team1, team2] using common separators.
 * Returns null if the title doesn't look like a "team1 vs team2" fixture.
 */
function _tryExtractTeams(title) {
  const clean = _compoundify(_stripNoise(title));
  const parts = clean.split(/\s(?:vs?\.?|@|[-–—])\s/i);
  if (parts.length === 2) {
    return [_tokenize(parts[0]).join(' '), _tokenize(parts[1]).join(' ')];
  }
  return null;
}

// ────────────────────────────────────────────────────────────────────────────

class MatchAggregator {
  constructor({ streamFreeProvider, timStreamsProvider, iptvOrgProvider, sportyHunterProvider, watchFootyProvider, cdnLiveProvider, streamSports99Provider, streamicProvider, strims24Provider, beinArabicProvider, streamedPkProvider, cacheService, yamlProviders }) {
    this.providers = [streamFreeProvider, timStreamsProvider, iptvOrgProvider, sportyHunterProvider, watchFootyProvider, cdnLiveProvider, streamSports99Provider, streamicProvider, strims24Provider, beinArabicProvider, streamedPkProvider, ...(yamlProviders || [])];
    this.cacheService = cacheService;
  }

  isSameEvent(e1, e2) {
    // 1. Category mismatch guard
    if (e1.category && e2.category && e1.category !== 'other' && e2.category !== 'other' && e1.category !== e2.category) {
      return false;
    }
    // 2. Exact ID match
    if (e1.id && e1.id === e2.id) return true;
    // 3. BeinArabic isolation — never merge with external events
    if (e1.id && e2.id && (e1.id.startsWith('bein_ar') || e2.id.startsWith('bein_ar'))) return false;
    // 4. Date window guard — events more than 24h apart are definitely different
    const d1 = Number(e1.date) || 0;
    const d2 = Number(e2.date) || 0;
    if (d1 && d2 && Math.abs(d1 - d2) > 86400000) return false;

    // 5. Dual-team extraction — if both titles parse as "team1 vs team2", require
    //    BOTH teams to independently fuzzy-match. This prevents merging
    //    "Real Madrid vs Barcelona" with "Atletico Madrid vs Barcelona".
    const t1 = _tryExtractTeams(e1.title);
    const t2 = _tryExtractTeams(e2.title);
    if (t1 && t2) {
      const fwdMatch = _teamsSimilar(t1[0], t2[0]) && _teamsSimilar(t1[1], t2[1]);
      const revMatch = _teamsSimilar(t1[0], t2[1]) && _teamsSimilar(t1[1], t2[0]);
      return fwdMatch || revMatch;
    }

    // 6. Fallback: Jaccard token overlap for channels / non-fixture titles
    const tokens1 = _tokenize(_compoundify(_stripNoise(e1.title)));
    const tokens2 = _tokenize(_compoundify(_stripNoise(e2.title)));
    if (tokens1.length === 0 || tokens2.length === 0) return false;
    const s1 = new Set(tokens1), s2 = new Set(tokens2);
    let common = 0;
    for (const w of s1) if (s2.has(w)) common++;
    const minLen = Math.min(s1.size, s2.size);
    const jaccard = common / Math.max(s1.size + s2.size - common, 1);
    return (minLen >= 2 && (common / minLen) >= 0.8) || jaccard >= 0.5;
  }

  async syncMatches() {
    console.log('[MatchAggregator] Fetching from all providers...');
    const finalMatches = [];

    const processProviderMatches = (providerMatches) => {
      if (!providerMatches || !Array.isArray(providerMatches)) return;
      providerMatches.forEach(match => {
        if (!match.id || !match.title) return;
        
        const existing = finalMatches.find(m => this.isSameEvent(m, match));
        if (!existing) {
          finalMatches.push(match);
        } else {
          if (match.sources && Array.isArray(match.sources)) {
            match.sources.forEach(src => {
              if (!existing.sources.find(s => s.id === src.id && s.source === src.source)) {
                existing.sources.push(src);
              }
            });
          }
          if (match.popular === '1') existing.popular = '1';
          if (!existing.poster && match.poster) existing.poster = match.poster;
          if (existing.description === 'No description' && match.description && match.description !== 'No description') {
            existing.description = match.description;
          }
          if (!existing.logo && match.logo) existing.logo = match.logo;
        }
      });
    };

    // Providers swallow their own errors and return []. A non-empty result is the
    // only reliable success signal; it keeps a total upstream outage from wiping the cache.
    let anyProviderSucceeded = false;

    if (process.env.LOW_MEMORY_MODE === 'true') {
      // Memory-safe sequential fetching (Alwaysdata)
      for (const p of this.providers) {
        try {
          const providerMatches = await p.getMatches();
          if (Array.isArray(providerMatches) && providerMatches.length > 0) anyProviderSucceeded = true;
          processProviderMatches(providerMatches);
        } catch (err) {
          console.error(`[MatchAggregator] Provider fetch failed:`, err.message);
        }
      }
    } else {
      // Fast parallel fetching (Render / Local)
      const results = await Promise.allSettled(this.providers.map(p => p.getMatches()));
      results.forEach((promiseResult, index) => {
        if (promiseResult.status === 'fulfilled') {
          if (Array.isArray(promiseResult.value) && promiseResult.value.length > 0) anyProviderSucceeded = true;
          processProviderMatches(promiseResult.value);
        } else {
          console.error(`[MatchAggregator] Provider ${index} failed:`, promiseResult.reason);
        }
      });
    }
    
    const now = Date.now();
    // Smart Trending Engine: Boost popular matches globally, but only if they are actually live or starting soon
    const TRENDING_KEYWORDS = ['bein', 'real madrid', 'barcelona', 'manchester', 'arsenal', 'liverpool', 'chelsea', 'bayern', 'psg', 'lakers', 'warriors', 'mcgregor', 'super bowl', 'champions league', 'el clasico', 'f1', 'formula 1', 'grand prix'];
    
    finalMatches.forEach(match => {
      const titleLower = match.title.toLowerCase();
      
      // Parse kickoff date (default to 0 if none provided, assume live)
      let kickoff = 0;
      if (match.date) {
        const parsed = Number(match.date);
        kickoff = isNaN(parsed) ? new Date(match.date).getTime() : parsed;
        if (isNaN(kickoff)) kickoff = 0;
      }
      // Allow matches to be flagged as 'Live' from 3 hours before kickoff up to 14 hours after kickoff
      const isWithinTimeWindow = kickoff === 0 || (now >= kickoff - (3 * 3600 * 1000) && now <= kickoff + (14 * 3600 * 1000));
      
      if (TRENDING_KEYWORDS.some(kw => titleLower.includes(kw))) {
        if (isWithinTimeWindow) {
          match.popular = '1';
        }
      }
      
      // GLOBAL FIX: Some providers (like Streamed.pk) flag future events as popular/live early.
      // We must override and strip the popular flag if the event is too far in the future.
      if (match.popular === '1' && kickoff > 0 && !isWithinTimeWindow) {
        match.popular = '0';
      }
    });

    // Filter out matches that are already over (kickoff was > 24 hours ago)
    const activeMatches = finalMatches.filter(match => {
      let kickoff = 0;
      if (match.date) {
        const parsed = Number(match.date);
        kickoff = isNaN(parsed) ? new Date(match.date).getTime() : parsed;
        if (isNaN(kickoff)) kickoff = 0;
      }
      if (kickoff === 0) return true; // Keep if we don't know the time

      // Keep matches up to 24 hours after kickoff, except TimStreams which we keep for 48 hours (VODs)
      const isTimStreams = match.sources && match.sources.some(s => s.source === 'timstreams');
      const expiryWindowMs = isTimStreams ? (48 * 3600 * 1000) : (24 * 3600 * 1000);
      return now <= kickoff + expiryWindowMs;
    });

    console.log(`[MatchAggregator] Sync complete. Merged ${activeMatches.length} active events.`);
    if (anyProviderSucceeded) {
      this.cacheService.setMatches(activeMatches);
    }
    return activeMatches;
  }
}

module.exports = MatchAggregator;
