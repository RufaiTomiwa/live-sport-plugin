const fs = require('fs');
const content = fs.readFileSync('lock.js', 'utf-8');

const regex = /function T59HXD.*?\{.{0,1500}/s;
const m = content.match(regex);
if (m) console.log(m[0]);
