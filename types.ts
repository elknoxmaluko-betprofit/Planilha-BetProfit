
export enum BetStatus {
  WON = 'WON',
  LOST = 'LOST',
  VOID = 'VOID',
  PENDING = 'PENDING'
}

export enum BetType {
  BACK = 'BACK',
  LAY = 'LAY'
}

export interface Bet {
  id: string;
  date: string;
  event: string;
  market: string;
  type: BetType;
  odds: number;
  stake: number;
  stakePercentage: number;
  profit: number;
  profitPercentage: number;
  status: BetStatus;
  methodology?: string;
  tags?: string[];
  league?: string; // Novo
  team?: string;   // Novo
}

export interface Stats {
  totalBets: number;
  winRate: number;
  totalProfit: number;
  roi: number;
  yield: number;
  monthlyStake: number;
  monthlyBankroll: number;
  uniqueMarketsCount: number;
  profitInStakes: number;
}

export interface MarketStats {
  name: string;
  bets: number;
  profit: number;
  winRate: number;
}
