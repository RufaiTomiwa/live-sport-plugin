const fs = require('fs');
const content = fs.readFileSync('lock.js', 'utf-8');

const regex = /function T59HXD.*?return(.*?)\}/s;
const m = content.match(regex);
if (m) console.log(m[0].substring(0, 1000));
