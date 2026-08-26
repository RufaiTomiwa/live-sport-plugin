fetch('https://assets.embedindia.st/js/bundle-jw.js')
    .then(r => r.text())
    .then(js => {
        const regex = /fetch\(([^)]+)\)/g;
        let m;
        while ((m = regex.exec(js)) !== null) {
            console.log(m[1].substring(0, 100));
        }
    })
    .catch(console.error);
