const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

// Update MethodologiesView
content = content.replace(
  /<MethodologiesView bets=\{filteredBets\} available=\{methodologiesList\}/,
  '<MethodologiesView monthlyStake={currentMonthlyStake} bets={filteredBets} available={methodologiesList}'
);

// Update LeaguesView
content = content.replace(
  /<LeaguesView bets=\{filteredBets\} available=\{leaguesList\}/,
  '<LeaguesView monthlyStake={currentMonthlyStake} bets={filteredBets} available={leaguesList}'
);

// Update TeamsView
content = content.replace(
  /<TeamsView bets=\{filteredBets\} availableTeams=\{teamsList\}/,
  '<TeamsView monthlyStake={currentMonthlyStake} bets={filteredBets} availableTeams={teamsList}'
);

// Update TagsView
content = content.replace(
  /<TagsView bets=\{filteredBets\} available=\{tagsList\}/,
  '<TagsView monthlyStake={currentMonthlyStake} bets={filteredBets} available={tagsList}'
);

fs.writeFileSync('App.tsx', content);
