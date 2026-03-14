const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'index.html');
let content = fs.readFileSync(file, 'utf8');

// The file was likely saved as UTF-8 but containing Windows-1252/Latin-1 decoded strings.
// To fix it, we convert the string back to its raw bytes (Latin1/binary) and decode as UTF-8.
const fixedContent = Buffer.from(content, 'binary').toString('utf8');

fs.writeFileSync(file, fixedContent, 'utf8');
console.log('Successfully fixed encoding in index.html');
