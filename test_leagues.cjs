const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

const regex = /const leaguesList = (.*?);/;
const match = content.match(regex);
console.log(match ? match[0] : "Not found");
