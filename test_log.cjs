const fs = require('fs');
let content = fs.readFileSync('components/Dashboard.tsx', 'utf8');

const match = `                    <text 
                      x={textX} 
                      y={textY} `;

const replace = `                    <text 
                      x={textX} 
                      y={textY} 
                      data-log={console.log("LABEL PROPS", {name: props.name, value: value, x, width, alignRight, textX})}
`;

content = content.replace(match, replace);
fs.writeFileSync('components/Dashboard.tsx', content);
