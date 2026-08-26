fetch('https://strmd.b-cdn.net/js/bundle-jw.js')
    .then(r => r.text())
    .then(js => {
        console.log("Length:", js.length);
        console.log("Has 'Assembly':", js.includes('Assembly'));
        console.log("Has '.wasm':", js.includes('.wasm'));
        console.log("Has 'instantiate':", js.includes('instantiate'));
        console.log("Has 'fetch':", js.includes('fetch'));
        
        let fetchMatch = js.match(/fetch\(([^)]+)\)/g);
        console.log("Fetch calls:", fetchMatch ? fetchMatch : "None");
    })
    .catch(console.error);
