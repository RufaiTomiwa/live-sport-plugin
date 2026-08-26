fetch('http://127.0.0.1:7000/stream/tv/nuvio_sport_spk_admin-rally-tv.json')
    .then(r => r.json())
    .then(data => {
        console.log("RALLY STREAM RESULT:");
        console.log(JSON.stringify(data, null, 2));
    })
    .catch(console.error);
