const crypto = require('crypto');
const fs = require('fs');

const ct = Buffer.from('6b276e5c6664264d3048312f616c30616d6e6e58784769277d327c31706f6f28672a30636a317b5b7a677a2e4e222946264d246c59592b6b314a236649636d65587e65616f682868212d4b6c7e586f694e5e496c5b5f50264f5d286c60466933316778217c425a4d246f287a2a7a2e71302846297b4a666c7d2f66296258695c6d7159336c5e3061665f6b6b4b4c6166323133233029226d502c7c3379214c2421656f237c627a6d5b227d29645b6054', 'hex');

const key = Buffer.from('d336ad6269db400272eba2221acaafdc44fd1dfe580fde8911fd365eddfde43b', 'hex');
const nonce = Buffer.from('289434c0368a06b546181f39', 'hex');

try {
  // standard chacha20
  const decipher = crypto.createDecipheriv('chacha20', key, nonce);
  let pt = decipher.update(ct);
  pt = Buffer.concat([pt, decipher.final()]);
  console.log('ChaCha20 Decrypted:', pt.toString('utf8'));
} catch (e) {
  console.log('ChaCha20 error:', e.message);
}

// let's also try poly1305 where last 16 bytes are auth tag
try {
  const c = ct.slice(0, ct.length - 16);
  const auth = ct.slice(ct.length - 16);
  const decipher2 = crypto.createDecipheriv('chacha20-poly1305', key, nonce, { authTagLength: 16 });
  decipher2.setAuthTag(auth);
  let pt2 = decipher2.update(c);
  pt2 = Buffer.concat([pt2, decipher2.final()]);
  console.log('ChaCha20-Poly1305 Decrypted:', pt2.toString('utf8'));
} catch (e) {
  console.log('ChaCha20-Poly1305 error:', e.message);
}
