// Test: can we call embedindia.st/fetch directly in pure Node.js
// and then decode the response WITHOUT any browser or WASM?

const https = require('https');
const http = require('http');

// The channel name is sent as protobuf: field 1, type 2 (length-delimited string)
// \x0a = field 1, wire type 2
// \x08 = length of "rally-tv" = 8
// then "rally-tv"
function encodeChannelProto(channel) {
  const channelBuf = Buffer.from(channel, 'utf8');
  const len = channelBuf.length;
  // Protobuf: field 1, wire type 2 (length-delimited) = (1 << 3) | 2 = 0x0a
  return Buffer.concat([Buffer.from([0x0a, len]), channelBuf]);
}

async function fetchRaw(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const lib = parsed.protocol === 'https:' ? https : http;
    const req = lib.request({
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    }, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks), headers: res.headers }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  const channel = process.argv[2] || 'rally-tv';
  console.log(`\n=== Testing pure HTTP approach for channel: ${channel} ===\n`);

  // Step 1: Fetch the embed page for the channel slug
  // First figure out the actual channel slug by fetching embedindia.st/embed-noads/<slug>
  const embedPageUrl = `https://embedindia.st/embed-noads/${channel}`;
  console.log(`[1] Fetching embed page: ${embedPageUrl}`);
  
  const embedPage = await fetchRaw(embedPageUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://embed.st/',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    }
  });
  
  console.log(`    Status: ${embedPage.status}`);
  console.log(`    Body (first 500): ${embedPage.body.toString('utf8', 0, 500)}\n`);

  // Step 2: POST to embedindia.st/fetch with protobuf-encoded channel name
  const protoBody = encodeChannelProto(channel);
  console.log(`[2] POSTing to https://embedindia.st/fetch`);
  console.log(`    Body hex: ${protoBody.toString('hex')}`);
  console.log(`    Body repr: ${JSON.stringify(protoBody.toString('binary'))}\n`);

  const fetchRes = await fetchRaw('https://embedindia.st/fetch', {
    method: 'POST',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Content-Type': 'application/octet-stream',
      'Content-Length': protoBody.length,
      'Referer': `https://embedindia.st/embed-noads/${channel}`,
      'Origin': 'https://embedindia.st',
      'Accept': '*/*'
    }
  }, protoBody);

  console.log(`    Response status: ${fetchRes.status}`);
  console.log(`    Response hex: ${fetchRes.body.toString('hex').slice(0, 200)}`);
  console.log(`    Response raw: ${JSON.stringify(fetchRes.body.toString('binary').slice(0, 300))}`);
  console.log(`    Response utf8: ${fetchRes.body.toString('utf8', 0, 300)}`);
  
  // Try to find any https:// URLs in the response
  const responseStr = fetchRes.body.toString('utf8');
  const urlMatches = responseStr.match(/https?:\/\/[^\s\x00-\x1f"<>]+/g);
  if (urlMatches) {
    console.log(`\n    FOUND URLS IN RESPONSE:`, urlMatches);
  } else {
    console.log(`\n    No plaintext URLs found — likely encrypted`);
    console.log(`    Response length: ${fetchRes.body.length} bytes`);
  }
}

main().catch(console.error);
