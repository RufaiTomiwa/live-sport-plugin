const { handleStream } = require('./src/streams');
async function run() {
    const res = await handleStream('tv', 'nuvio_sport_tim_motor-sports_rally-tv', {});
    console.log(JSON.stringify(res, null, 2));
}
run();
