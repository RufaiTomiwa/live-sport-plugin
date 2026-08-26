fetch('http://127.0.0.1:7000/api/proxy-embed?url=https%3A%2F%2Fembedindia.st%2Fembed%2Frally-tv&referer=https%3A%2F%2Fembedindia.st%2F')
    .then(r => r.text())
    .then(html => {
        let m3u8Regex = /(https?:\/\/[^'"]+\.m3u8)/;
        let match = html.match(m3u8Regex);
        if (match) {
            console.log("SUCCESS M3U8 FOUND:", match[1]);
        } else {
            console.log("FAILED TO FIND M3U8 IN HTML!");
            
            // Check for base64 encoded strings
            let atobMatch = html.match(/atob\(['"]([^'"]+)['"]/);
            if (atobMatch) {
                console.log("Found atob:", Buffer.from(atobMatch[1], 'base64').toString('utf8'));
            } else {
                console.log("No atob found");
            }
        }
    })
    .catch(console.error);
