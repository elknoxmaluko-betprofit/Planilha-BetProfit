
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

export interface Project {
  id: string;
  name: string;
  startBankroll: number;
  goal?: number;
  startDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  description?: string;
  projectType?: 'STANDARD' | 'BALIZA_ZERO' | 'NETTUNO_CICLOS';
  stakeGoal?: number;
  balizaZeroTargetMultiplier?: number;      
  bankrollDivision?: number;
  activeDezenaIndex?: number; // Novo: Índice da dezena atualmente ativa (0, 1, 2...)
  activeCycleIndex?: number; // Índice do ciclo para NETTUNO_CICLOS (0 a 4)
  nettunoCyclesCount?: 5 | 10; // Novo: Numero de ciclos 5 ou 10
  nettunoInitialPercentage?: number; // % Inicial para método Nettuno (ex: 5%)
  tag?: string; // Novo: Tag identificadora do projeto para capturar apostas automaticamente
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
  league?: string;
  team?: string;
  projectId?: string;
  dezenaIndex?: number; // Novo: Índice da dezena a que esta aposta pertence
  cycleIndex?: number; // Índice do ciclo a que esta aposta pertence (NETTUNO_CICLOS)
  
  // Novos campos para Anotações
  homeScore?: string;
  awayScore?: string;
  operationMoment?: string;
  redForm?: string;
  goalForm?: string;
  goalMoment?: string;
  evaluation?: 'OK' | 'RUIM' | 'PÉSSIMO' | '';
  notes?: string;
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
