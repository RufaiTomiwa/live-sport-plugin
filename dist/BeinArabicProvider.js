const BaseProvider = require('./BaseProvider');
const MatchEntity = require('../domain/MatchEntity');
const StreamEntity = require('../domain/StreamEntity');

class BeinArabicProvider extends BaseProvider {
  constructor(opts) {
    super(opts);
    this.name = 'BeinArabic';
    
    // Arabic beIN Sports Channels Static List with Yalla Shoot URLs for Sniffing
    this.channels = [
      { id: 'bein_ar_1_premium', title: 'beIN Sports 1 Premium', url: 'https://v2.yalla-shoot.tv/live/bein-sports-1-premium/', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/BeIN_SPORTS_2017.svg/512px-BeIN_SPORTS_2017.svg.png' },
      { id: 'bein_ar_2_premium', title: 'beIN Sports 2 Premium', url: 'https://v2.yalla-shoot.tv/live/bein-sports-2-premium/', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/BeIN_SPORTS_2017.svg/512px-BeIN_SPORTS_2017.svg.png' },
      { id: 'bein_ar_3_premium', title: 'beIN Sports 3 Premium', url: 'https://v2.yalla-shoot.tv/live/bein-sports-3-premium/', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/BeIN_SPORTS_2017.svg/512px-BeIN_SPORTS_2017.svg.png' },
      { id: 'bein_ar_1', title: 'beIN Sports 1', url: 'https://v2.yalla-shoot.tv/live/bein-sports-1/', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/BeIN_SPORTS_2017.svg/512px-BeIN_SPORTS_2017.svg.png' },
      { id: 'bein_ar_2', title: 'beIN Sports 2', url: 'https://v2.yalla-shoot.tv/live/bein-sports-2/', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/BeIN_SPORTS_2017.svg/512px-BeIN_SPORTS_2017.svg.png' },
      { id: 'bein_ar_3', title: 'beIN Sports 3', url: 'https://v2.yalla-shoot.tv/live/bein-sports-3/', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/BeIN_SPORTS_2017.svg/512px-BeIN_SPORTS_2017.svg.png' },
      { id: 'bein_ar_4', title: 'beIN Sports 4', url: 'https://v2.yalla-shoot.tv/live/bein-sports-4/', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/BeIN_SPORTS_2017.svg/512px-BeIN_SPORTS_2017.svg.png' },
      { id: 'bein_ar_5', title: 'beIN Sports 5', url: 'https://v2.yalla-shoot.tv/live/bein-sports-5/', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/BeIN_SPORTS_2017.svg/512px-BeIN_SPORTS_2017.svg.png' },
      { id: 'bein_ar_6', title: 'beIN Sports 6', url: 'https://v2.yalla-shoot.tv/live/bein-sports-6/', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/BeIN_SPORTS_2017.svg/512px-BeIN_SPORTS_2017.svg.png' },
      { id: 'bein_ar_7', title: 'beIN Sports 7', url: 'https://v2.yalla-shoot.tv/live/bein-sports-7/', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/BeIN_SPORTS_2017.svg/512px-BeIN_SPORTS_2017.svg.png' },
      { id: 'bein_ar_news', title: 'beIN Sports News', url: 'https://v2.yalla-shoot.tv/live/bein-sports-news/', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/BeIN_SPORTS_2017.svg/512px-BeIN_SPORTS_2017.svg.png' },
    ];
  }

  async getMatches() {
    const matches = [];
    try {
      this.channels.forEach(ch => {
        matches.push(new MatchEntity({
          id: ch.id,
          title: ch.title,
          category: 'networks',
          date: '0', // 24/7 channel
          popular: '1', // Boost these
          league: 'Live TV (MENA)',
          thumbnail_url: ch.logo,
          sources: [{ source: this.name, id: ch.id }]
        }));
      });
    } catch (err) {
      console.error(`[${this.name}] Error building matches:`, err.message);
    }
    return matches;
  }

  async resolveStream(sourceId, matchCategory, matchTitle) {
    const streams = [];
    
    const channel = this.channels.find(c => c.id === sourceId);
    if (!channel) return streams;

    const targetUrl = channel.url;



    // Fallback to direct stream format if sniffer fails
    streams.push(new StreamEntity({
      name: 'Bein Arabic (Direct Proxy)',
      title: `${matchTitle} (Direct IPTV)`,
      url: `http://live.daddylive.stream/hls/${sourceId}/index.m3u8`,
      behaviorHints: { notWebReady: true },
      resolution: 'HD'
    }));

    // Fallback to web players
    streams.push(new StreamEntity({
      name: 'Yalla Shoot (Arabic)',
      title: `${matchTitle} (Web Player)`,
      externalUrl: targetUrl,
      resolution: 'HD'
    }));

    return streams;
  }
}

module.exports = BeinArabicProvider;
