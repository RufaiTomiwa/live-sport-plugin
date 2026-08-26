const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

const regex = /function [A-Za-z0-9_]+\(.*?\)\{.*?67CHo7.*?\}/s;
const m = content.match(regex);
console.log(m ? m[0].substring(0, 500) : "Not found!");
