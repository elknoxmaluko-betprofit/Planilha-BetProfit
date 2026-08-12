const fs = require('fs');
let content = fs.readFileSync('components/Dashboard.tsx', 'utf8');

const regex = /const CustomTooltip = \(\{ active[\s\S]*?<\/div>\s*\);\s*\};/m;

const newCard = `const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl shadow-lg">
        <p className="text-slate-200 font-bold mb-1">{label}</p>
        <p className="text-emerald-400 font-mono text-sm">Yield: {payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

const RankingCard: React.FC<{ title: string; data: any[]; color: string; icon: string; alignRight?: boolean }> = ({ title, data, color, icon, alignRight }) => (
  <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-5 lg:p-8 shadow-md">
    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
      <i className={\`fas \${icon}\`} style={{ color }}></i> {title}
    </h3>
    <div className="h-[200px] lg:h-[250px]">
      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: alignRight ? 40 : 0, right: alignRight ? 0 : 40, top: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} fontWeight="bold" tickLine={false} axisLine={false} width={80} orientation={alignRight ? 'right' : 'left'} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b', opacity: 0.2 }} />
            <Bar dataKey="profit" fill={color} radius={alignRight ? [4, 0, 0, 4] : [0, 4, 4, 0]} barSize={16}>
               <LabelList 
                dataKey="profit" 
                content={(props: any) => {
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
                }} 
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full text-slate-500 italic text-sm">Sem dados</div>
      )}
    </div>
  </div>
);`;

// We replace everything from CustomTooltip to the end of RankingCard
const fullRegex = /const CustomTooltip = \(\{ active[\s\S]*?<\/div>\s*\);\s*\};/m;
content = content.replace(/const CustomTooltip = \(\{ active[\s\S]*?<\/div>\s*<\/div>\s*\);\s*/m, newCard);
fs.writeFileSync('components/Dashboard.tsx', content);
