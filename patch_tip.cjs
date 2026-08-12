const fs = require('fs');
let content = fs.readFileSync('components/Dashboard.tsx', 'utf8');

const matchRegex = /content=\{\(props: any\) => \{[\s\S]*?return \([\s\S]*?<text[\s\S]*?<\/text>\);\s*\}\}/;

const replace = `content={(props: any) => {
                  const { x, y, width, height, value } = props;
                  const leftmost = Math.min(x, x + width);
                  const rightmost = Math.max(x, x + width);
                  
                  // For alignRight (negative values), the tip is on the left
                  // For normal (positive values), the tip is on the right
                  const textX = alignRight ? leftmost - 5 : rightmost + 5;
                  const textY = y + height / 2;
                  return (
                    <text 
                      x={textX} 
                      y={textY} 
                      dy={3} 
                      fill="#94a3b8" 
                      fontSize={10} 
                      fontWeight="bold" 
                      textAnchor={alignRight ? 'end' : 'start'}
                    >
                      {value}%
                    </text>
                  );
                }}`;

content = content.replace(matchRegex, replace);
fs.writeFileSync('components/Dashboard.tsx', content);
