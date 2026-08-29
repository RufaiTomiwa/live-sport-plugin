/**
 * ChannelLogoService.js
 * 
 * Maps known 24/7 sports networks and TV channels to high-resolution
 * transparent PNG logos and backdrop art from tv-logos CDN and Wikimedia.
 */

const CHANNEL_LOGOS = {
  // Cricket
  "willow": "https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/united-states/willow-us.png",
  "willow cricket": "https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/united-states/willow-us.png",
  "fox cricket": "https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/australia/fox-sports-au.png",
  "sky sports cricket": "https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/united-kingdom/sky-sports-cricket-uk.png",

  // Tennis
  "tennis channel": "https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/united-states/tennis-channel-us.png",

  // F1 & Motorsport
  "sky sports f1": "https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/united-kingdom/sky-sports-f1-uk.png",
  "rally tv": "https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/international/wrc-plus.png",

  // Football / Soccer & Multi-Sport
  "sky sports main event": "https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/united-kingdom/sky-sports-main-event-uk.png",
  "sky sports premier league": "https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/united-kingdom/sky-sports-premier-league-uk.png",
  "sky sports football": "https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/united-kingdom/sky-sports-football-uk.png",
  "tnt sports 1": "https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/united-kingdom/tnt-sports-1-uk.png",
  "tnt sports 2": "https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/united-kingdom/tnt-sports-2-uk.png",
  "eurosport 1": "https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/united-kingdom/eurosport-1-uk.png",
  "eurosport 2": "https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/united-kingdom/eurosport-2-uk.png",
  "bein sports usa": "https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/united-states/bein-sports-us.png",
  "bein sports xtra": "https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/united-states/bein-sports-xtra-us.png",
  "cbs sports network": "https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/united-states/cbs-sports-network-us.png",
  "cbs sports golazo network": "https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/united-states/cbs-sports-golazo-network-us.png",

  // US Major Networks (ESPN, Fox, NBC, Major Leagues)
  "espn": "https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/united-states/espn-us.png",
  "espn 2": "https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/united-states/espn-2-us.png",
  "espn 3": "https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/united-states/espn-3-us.png",
  "espnu": "https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/united-states/espnu-us.png",
  "espnews": "https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/united-states/espnews-us.png",
  "espn8": "https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/united-states/espn-us.png",
  "fox sports 1": "https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/united-states/fox-sports-1-us.png",
  "fox sports 2": "https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/united-states/fox-sports-2-us.png",
  "fox deportes": "https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/united-states/fox-deportes-us.png",
  "fox league": "https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/australia/fox-sports-au.png",
  "nbc sports now": "https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/united-states/nbc-sports-us.png",
  "nbc sports bay area": "https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/united-states/nbc-sports-bay-area-us.png",
  "nba tv": "https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/united-states/nba-tv-us.png",
  "nfl network": "https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/united-states/nfl-network-us.png",
  "nfl redzone": "https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/united-states/nfl-redzone-us.png",
  "mlb network": "https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/united-states/mlb-network-us.png",
  "mlb strike zone": "https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/united-states/mlb-strike-zone-us.png",
  "nhl network": "https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/united-states/nhl-network-us.png",
  "fight network": "https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/canada/fight-network-ca.png"
};

function getChannelLogo(title) {
  if (!title) return null;
  const lower = title.toLowerCase().trim();
  
  // Exact match
  if (CHANNEL_LOGOS[lower]) return CHANNEL_LOGOS[lower];

  // Substring match
  for (const [key, logoUrl] of Object.entries(CHANNEL_LOGOS)) {
    if (lower.includes(key)) {
      return logoUrl;
    }
  }

  return null;
}

module.exports = {
  getChannelLogo,
  CHANNEL_LOGOS
};
