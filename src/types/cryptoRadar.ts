export type TabId = 'overview' | 'liquidation' | 'whales' | 'etf' | 'macro' | 'unlocks' | 'routine';

export interface LiquidationLevel {
  price: number;
  longVolMillion: number;
  shortVolMillion: number;
  intensity: 'critical' | 'high' | 'medium' | 'low'; // yellow/orange gradient
  note?: string;
}

export interface CoinLiquidationData {
  symbol: string;
  name: string;
  currentPrice: number;
  change24h: number;
  coinbasePremium: number; // in %
  coinbasePremiumSignal: 'bullish' | 'bearish' | 'neutral';
  fundingRate: number; // in % e.g. 0.012%
  openInterestBillion: number; // e.g. 38.5B
  openInterestChange24h: number;
  longRatio: number; // e.g. 52.4%
  shortRatio: number; // e.g. 47.6%
  topLongLiquidationZone: { price: number; volumeMillion: number };
  topShortLiquidationZone: { price: number; volumeMillion: number };
  levels: LiquidationLevel[];
}

export interface WhaleEntity {
  id: string;
  name: string;
  category: 'Government' | 'Institution' | 'Custodian' | 'Market Maker';
  btcBalance: number;
  usdValueBillion: number;
  recentAction: string;
  status: 'Accumulating' | 'Holding' | 'Distributing' | 'Neutral';
  lastMovementTime: string;
  sourceAddressSnippet: string;
  arkhamSlug?: string;
  address?: string;
  recentTransactions: {
    id: string;
    timestamp: string;
    amount: string;
    usdValue: string;
    from: string;
    to: string;
    txType: 'Transfer to Exchange (Xả)' | 'Withdrawal from Exchange (Gom)' | 'Internal Cold Transfer';
    hash: string;
  }[];
}

export interface ExchangeNetflowDay {
  date: string;
  btcInflow: number;
  btcOutflow: number;
  netflow: number; // negative = net outflow (gom hàng), positive = net inflow (xả)
  priceBtc: number;
}

export interface WhaleAlertTx {
  id: string;
  timeAgo: string;
  exactTime: string;
  symbol: string;
  amount: number;
  amountUsdMillion: number;
  from: string;
  to: string;
  txType: 'to_exchange' | 'from_exchange' | 'wallet_to_wallet';
  highlightNotice?: string;
}

export interface EtfDailyFlow {
  date: string;
  dayOfWeek: string;
  ibit: number; // BlackRock
  fbtc: number; // Fidelity
  bitb: number; // Bitwise
  arkb: number; // ARK 21Shares
  btco: number; // Invesco
  gbtc: number; // Grayscale
  miniBtc: number; // Grayscale Mini
  others: number;
  totalNet: number; // Total net flow in $M
}

export interface EthEtfDailyFlow {
  date: string;
  dayOfWeek: string;
  etha: number; // BlackRock
  feth: number; // Fidelity
  ethw: number; // Bitwise
  ethe: number; // Grayscale
  others: number;
  totalNet: number;
}

export interface MacroEvent {
  id: string;
  title: string;
  country: string;
  flag: string;
  scheduledTime: string; // ISO string or target timestamp
  timeDisplayVn: string;
  impact: 'high' | 'medium' | 'low'; // high = red folder
  forecast: string;
  previous: string;
  actual?: string;
  unit: string;
  description: string;
  marketImpactGuide: string;
  hasPassed: boolean;
}

export interface TokenUnlock {
  id: string;
  symbol: string;
  name: string;
  unlockDate: string; // YYYY-MM-DD
  unlockTimeVn: string;
  daysRemaining: number;
  unlockType: 'Cliff' | 'Linear' | 'Mixed';
  unlockedTokensMillion: number;
  unlockedValueUsdMillion: number;
  percentOfCirculating: number;
  percentOfTotalSupply: number;
  riskLevel: 'CRITICAL (>5%)' | 'HIGH (3-5%)' | 'MODERATE (<3%)';
  allocations: {
    category: string;
    percent: number;
    valueMillion: number;
  }[];
  warningNote: string;
}

export interface MorningChecklistStep {
  id: number;
  durationMinutes: number;
  title: string;
  toolName: string;
  toolUrl: string;
  targetTab: TabId;
  description: string;
  keyQuestions: string[];
  isCompleted: boolean;
}

export interface CustomMacroAlert {
  id: string;
  eventType: string; // e.g. "CPI (US)", "Fed Interest Rate Decision", "Non-Farm Payrolls (NFP)", "PPI", "All Red Folders"
  leadTimeMinutes: number; // e.g. 5, 15, 30, 60, or 0 (at release)
  soundEnabled: boolean;
  notifyBrowser: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface CustomTokenUnlockAlert {
  id: string;
  symbol: string; // e.g. "TIA", "ARB", "SUI", "XPL"
  minUnlockPercentage: number; // e.g. 3% or 5%
  minUsdValueMillion: number; // e.g. 10 ($10M)
  notifyDaysBefore: number; // e.g. 1, 3, 7 days
  soundEnabled: boolean;
  notifyBrowser: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface AlertNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'macro' | 'unlock' | 'whale' | 'liquidation';
  severity: 'high' | 'medium' | 'info';
}

export type GroqModelId =
  | 'openai/gpt-oss-120b'
  | 'openai/gpt-oss-20b'
  | 'qwen/qwen3.8-27b'
  | 'deepseek-r1-distill-llama-70b'
  | 'llama-3.1-8b-instant'
  | 'llama-3.3-70b-versatile';

export interface TradingVerdict {
  action: 'LONG' | 'SHORT' | 'HOLD_CASH';
  actionLabel: string;
  confidenceScore: number;
  summaryHeadline: string;
  entryRange: string;
  stopLoss: string;
  takeProfit: string;
  riskRewardRatio: string;
  keyReasons: string[];
  riskWarnings: string[];
  pillarSignals: {
    pillar1Liquidation: string;
    pillar2Whales: string;
    pillar3Etf: string;
    pillar4Macro: string;
    pillar5Unlocks: string;
  };
  detailedAnalysis: string;
  timestamp: string;
  modelUsed: string;
}

