const fs = require('fs');

const bundle = fs.readFileSync('bundle-jw.js', 'utf8');

// We will regex extract the array and the deobfuscator function, and then evaluate them!
// Actually, easier: just run bundle-jw.js in a VM, but replace the mXvvab=await import(...) with a mock that just prints what's being accessed!

let modified = bundle.replace(
    "mXvvab=await import(kB58FF+(SN9Fvu(Xz2Qvh[0x126])+SN9Fvu(Xz2Qvh[0x127])+Xz2Qvh[0x7b]));",
    "console.log('FUNC1:', SN9Fvu(Xz2Qvh[0x128])+Xz2Qvh[0x11b]); console.log('FUNC2:', SN9Fvu(Xz2Qvh[0x129])+SN9Fvu(Xz2Qvh[0x12a])); console.log('ARG:', Mg32Bo3(SN9Fvu(Xz2Qvh[0x120])+Xz2Qvh[0x121])[SN9Fvu(Xz2Qvh[0x122])+Xz2Qvh[0x123]][SN9Fvu(Xz2Qvh[0x124])]+SN9Fvu(Xz2Qvh[0x125])); process.exit(0);"
);

fs.writeFileSync('bundle-jw-print.js', modified);
