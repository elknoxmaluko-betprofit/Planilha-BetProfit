const fs = require('fs');
let content = fs.readFileSync('components/Dashboard.tsx', 'utf8');

const match = `<LabelList dataKey="profit" position={alignRight ? 'left' : 'right'} formatter={(val: number) => \`\${val}%\`} fill="#94a3b8" fontSize={10} fontWeight="bold" />`;

const replace = `<LabelList 
                dataKey="profit" 
                content={(props: any) => {
                  const { x, y, width, height, value } = props;
                  const textX = alignRight ? x - 5 : x + width + 5;
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
                }} 
              />`;

content = content.replace(match, replace);
fs.writeFileSync('components/Dashboard.tsx', content);
