const months = {
    'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
    'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11,
    'fev': 1, 'abr': 3, 'mai': 4, 'ago': 7, 'set': 8, 'out': 9, 'dez': 11
};

const dateStrs = [
    '25-jul.-26 13:00',
    '"09-Jul-26 13:00:00"',
    '09/07/2026'
];

dateStrs.forEach(d => {
    const cleanDateStr = d.toLowerCase().replace(/["']/g, '').trim();
    // Allow optional dot after month
    const match = cleanDateStr.match(/(\d{1,2})[/-]([a-z]{3}|\d{1,2})\.?[/-](\d{2,4})(?:\s+(\d{1,2}:\d{2}(?::\d{2})?))?/);
    console.log(d, "=> match:", !!match);
    if (match) {
        let monthStr = match[2];
        let month = isNaN(Number(monthStr)) ? (months[monthStr] || 0) : (parseInt(monthStr) - 1);
        let year = parseInt(match[3]);
        if (year < 100) year += 2000;
        console.log("   Parsed:", year, month, match[1], match[4]);
    }
});
