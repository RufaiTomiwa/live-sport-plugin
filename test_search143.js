const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');
// Hmm, __wbg_new_b5d9e2fb389fef91 was not there?
// The console.log matched the beginning of xwy5d8 array!
// Let's decode xwy5d8 strings? No.
// Let's match the exact string without using index:
let matches = content.match(/.{0,50}__wbg_new_b5d9e2fb389fef91.{0,200}/g);
if (matches) {
    console.log("Matches:", matches.length);
    console.log(matches[0]);
} else {
    console.log("Not found natively... wait, how did it appear in imports?");
    console.log("Maybe it's inside xwy5d8?");
}
