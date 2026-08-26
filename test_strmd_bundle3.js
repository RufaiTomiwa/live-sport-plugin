fetch('https://strmd.b-cdn.net/js/bundle-jw.js')
    .then(r => r.text())
    .then(js => {
        console.log("Has 'XMLHttpRequest':", js.includes('XMLHttpRequest'));
        console.log("Has 'fetch':", js.includes('fetch'));
        
        let xhrMatch = js.match(/XMLHttpRequest/g);
        console.log("XHR matches:", xhrMatch ? xhrMatch.length : 0);
    })
    .catch(console.error);
