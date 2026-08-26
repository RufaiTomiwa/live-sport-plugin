const fs = require('fs');
const wat = fs.readFileSync('lock.wat', 'utf8');

const dataLines = wat.split('\n').filter(line => line.includes('(data'));
console.log('Data segments:', dataLines.length);

dataLines.forEach((line, i) => {
    console.log('Segment', i, ':', line.trim().substring(0, 150));
});
