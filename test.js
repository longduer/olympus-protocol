const fs = require("fs");

let source = fs.readFileSync('abi', 'utf8');
console.info(source);
