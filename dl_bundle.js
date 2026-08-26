const fs = require('fs');
const axios = require('axios');
const jsbeautify = require('js-beautify').js;

async function run() {
    const res = await axios.get('https://strmd.b-cdn.net/js/bundle-jw.js');
    const code = jsbeautify(res.data, { indent_size: 2, space_in_empty_paren: true });
    fs.writeFileSync('bundle-jw-fmt.js', code);
    console.log('Saved formatted bundle-jw.js to bundle-jw-fmt.js');
}
run();
