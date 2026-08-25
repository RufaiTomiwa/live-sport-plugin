const BaseProvider = require('./BaseProvider');
const MatchEntity = require('../domain/MatchEntity');
const StreamEntity = require('../domain/StreamEntity');

class StreamedPkProvider extends BaseProvider {
  constructor(opts) {
    super(opts);
    this.name = 'StreamedPk';
    this.embedStProvider = opts.embedStProvider;
    this.apiUrl = 'https://streamed.pk/api';

    this.fetchMatches = this.circuitBreaker.wrap(`${this.name}_fetchMatches`, async () => {
      const res = await this.proxyFetch(`${this.apiUrl}/matches/all`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(15000)
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    });

    this.fetchStreams = this.circuitBreaker.wrap(`${this.name}_fetchStreams`, async (source, id) => {
      const url = `${this.apiUrl}/stream/${encodeURIComponent(source)}/${encodeURIComponent(id)}`;
      const res = await this.proxyFetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(10000)
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    });
  }

  async getMatches() {
    const matches = [];
    try {
      const data = await this.fetchMatches.fire();
      if (Array.isArray(data)) {
        for (const item of data) {
          if (!item.id || !item.title) continue;

          // Map sources
          const sources = (item.sources || []).map(s => ({
            source: 'streamedpk',
            id: item.id,
            streamSource: s.source,
            streamId: s.id
          }));

          if (sources.length === 0) {
            sources.push({
              source: 'streamedpk',
              id: item.id
            });
          }

          matches.push(new MatchEntity({
            id: `spk_${item.id}`,
            title: item.title,
            category: this.normalizeCategory(item.category),
            status: item.date && item.date < Date.now() ? 'live' : 'upcoming',
            date: String(item.date || Date.now()),
            popular: item.popular ? '1' : '0',
            poster: item.poster ? (item.poster.startsWith('http') ? item.poster : `https://streamed.pk${item.poster}`) : '',
            sources: sources
          }));
        }
      }
    } catch (err) {
      console.error(`[${this.name}] Failed to get matches:`, err.message);
    }
    return matches;
  }

  async resolveStream(sourceId, matchCategory, matchTitle, src = {}) {
    const streams = [];
    try {
      const streamSource = src.streamSource || 'admin';
      const streamId = src.streamId || sourceId;

      const streamList = await this.fetchStreams.fire(streamSource, streamId);
      if (Array.isArray(streamList)) {
        // Chunk the stream list to prevent memory spiking on Render (512MB RAM limit).
        // Executing max 3 WASM child processes at a time keeps RAM usage very safe.
        const CHUNK_SIZE = 3;
        for (let i = 0; i < streamList.length; i += CHUNK_SIZE) {
          const chunk = streamList.slice(i, i + CHUNK_SIZE);
          
          const resolvePromises = chunk.map(async (streamItem) => {
            if (!streamItem.embedUrl) return [];
            
            const label = streamItem.language ? `${matchTitle} (${streamItem.language})` : `${matchTitle} Stream ${streamItem.streamNo || 1}`;
            
            if (this.embedStProvider) {
              return await this.embedStProvider.resolveStream(
                streamItem.embedUrl,
                matchCategory,
                label,
                { embedUrl: streamItem.embedUrl }
              );
            } else {
              return [new StreamEntity({
                name: 'StreamedPk',
                title: `${label} (Web Player)`,
                externalUrl: `/watch?url=${encodeURIComponent(streamItem.embedUrl)}&title=${encodeURIComponent(matchTitle || 'Live Event')}`
              })];
            }
          });

          const results = await Promise.allSettled(resolvePromises);
          for (const result of results) {
            if (result.status === 'fulfilled' && Array.isArray(result.value)) {
              streams.push(...result.value);
            }
          }
        }
      }
    } catch (err) {
      console.error(`[${this.name}] resolveStream failed for ${sourceId}:`, err.message);
    }
    return streams;
  }
}

module.exports = StreamedPkProvider;
