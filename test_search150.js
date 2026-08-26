const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

// Is the name generated? 
// wait! 	dEyx0(xwy5d8[...]) generates names.
// What was the function inside lock.js that __wbg_new_b5d9e2fb389fef91 maps to?
// We can find out by tracing which unction is assigned to [tdEyx0(xwy5d8[something])]: function(...)
// Or we can just log the arguments in __wbg_new_b5d9e2fb389fef91 and then find which function in lock.js calls 
ew Promise.
