export interface MiningRig {
  name: string;
  description: string;
  owner: string;
  totalRewards: string;
}

export interface ContractState {
  totalShares: number;
  sharesRemaining: number;
  maxCapPerWallet: number;
  pricePerShare: string;
  totalDepositedRewards: string;
  rewardPerShare: string;
  userShares: number;
  claimablePeriod: number;
  claimableAmount: number;
  shareId: number;
  hasClaimedRewards: boolean;
}

export interface TransactionLog {
  id: string;
  type: 'success' | 'error' | 'pending' | 'info';
  message: string;
  timestamp: Date;
  txHash?: string;
}

export interface ContractEvent {
  event: string;
  args: any;
  transactionHash: string;
  blockNumber: number;
  timestamp: Date;
}