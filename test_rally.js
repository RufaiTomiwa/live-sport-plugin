const fs = require('fs');
fetch('https://streamed.pk/api/matches/all', {
    headers: {
        'User-Agent': 'Mozilla/5.0'
    }
}).then(r => r.json()).then(data => {
    let matches = data.filter(m => JSON.stringify(m).toLowerCase().includes('rally'));
    console.log("StreamedPk Rally TV:", JSON.stringify(matches, null, 2));
}).catch(console.error);

fetch('https://timstreams.st/api/live-upcoming').then(r => r.json()).then(data => {
    let matches = (data.events || []).filter(m => JSON.stringify(m).toLowerCase().includes('rally'));
    console.log("TimStreams Rally TV:", JSON.stringify(matches, null, 2));
}).catch(console.error);
