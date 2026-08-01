const fs = require('fs');
let content = fs.readFileSync('components/CategoryDetailsModal.tsx', 'utf8');

content = content.replace(
  /import \{ AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer \} from 'recharts';/,
  `import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TeamBadge } from './TeamsView';
import { LeagueBadge } from './LeaguesView';`
);

content = content.replace(
  /onClose: \(\) => void;\n\}/,
  `onClose: () => void;
  type?: 'team' | 'league' | 'tag' | 'methodology';
}`
);

content = content.replace(
  /const CategoryDetailsModal: React\.FC<CategoryDetailsModalProps> = \(\{ title, icon, bets, currency, monthlyStake, onClose \}\) => \{/,
  'const CategoryDetailsModal: React.FC<CategoryDetailsModalProps> = ({ title, icon, bets, currency, monthlyStake, onClose, type = "methodology" }) => {'
);

const oldHeaderIcon = `<i className={\`fas \${icon} text-yellow-400\`}></i> {title}`;
const newHeaderIcon = `{type === 'team' ? (
                <TeamBadge teamName={title} size="sm" editable={false} />
              ) : type === 'league' ? (
                <LeagueBadge leagueName={title} size="sm" editable={false} />
              ) : (
                <i className={\`fas \${icon} text-yellow-400\`}></i>
              )} {title}`;

content = content.replace(oldHeaderIcon, newHeaderIcon);
fs.writeFileSync('components/CategoryDetailsModal.tsx', content);
