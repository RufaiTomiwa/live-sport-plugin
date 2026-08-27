const container = require('./src/container');
const p = container.resolve('strims24Provider');

async function test() {
  console.log('Resolving FS:4xGUsOp1...');
  try {
    const streams = await p.resolveStream('FS:4xGUsOp1', 'football', 'Test Title');
    console.log('Streams found:', streams.length);
    console.log(JSON.stringify(streams, null, 2));
  } catch (e) {
    console.error('Error:', e);
  }
  process.exit(0);
}
test();
