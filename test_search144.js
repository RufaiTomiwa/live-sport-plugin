const fs = require('fs');
let content = fs.readFileSync('lock.js', 'utf-8');

// It's probably in the Wasm string table, and we dynamically map imports in lock.js?
// Ah! In lock_mod12.js we saw DECODE ... for all these names!
// Let's proxy the functions in test_proxy_lock.mjs to trace them completely.
