import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './WalletContext';
import { MINING_RIG_OWNERSHIP_ABI, MINING_RIG_SHARE_ABI } from '../contracts/abis';
import { ContractState, TransactionLog, ContractEvent } from '../types/contracts';

interface ContractContextType {
  ownershipContract: ethers.Contract | null;
  shareContract: ethers.Contract | null;
  contractAddresses: {
    OWNERSHIP: string;
    SHARE: string;
  };
  contractState: ContractState;
  logs: TransactionLog[];
  events: ContractEvent[];
  isLoading: boolean;
  refreshContractState: () => Promise<void>;
  addLog: (log: Omit<TransactionLog, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
}

const ContractContext = createContext<ContractContextType | undefined>(undefined);

// Update with actual deployed contract addresses on Polygon Amoy
const CONTRACT_ADDRESSES = {
  OWNERSHIP: "0xd4dC87783F0460106eE988f118a3dB824fF160E6", // Replace with actual address
  SHARE: "0x2dcfC814801364B34fA00894d4832e030585298C", // Replace with actual address
};

interface ContractProviderProps {
  children: ReactNode;
}

export const ContractProvider: React.FC<ContractProviderProps> = ({ children }) => {
  const { signer, provider, account } = useWallet();
  const [ownershipContract, setOwnershipContract] = useState<ethers.Contract | null>(null);
  const [shareContract, setShareContract] = useState<ethers.Contract | null>(null);
  const [contractState, setContractState] = useState<ContractState>({
    totalShares: 0,
    sharesRemaining: 0,
    maxCapPerWallet: 0,
    pricePerShare: '0',
    totalDepositedRewards: '0',
    rewardPerShare: '0',
    userShares: 0,
    claimablePeriod: 0,
    claimableAmount: 0,
    shareId: 0,
    hasClaimedRewards: false,
  });
  const [logs, setLogs] = useState<TransactionLog[]>([]);
  const [events, setEvents] = useState<ContractEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (signer && provider) {
      try {
        const ownership = new ethers.Contract(CONTRACT_ADDRESSES.OWNERSHIP, MINING_RIG_OWNERSHIP_ABI, signer);
        const share = new ethers.Contract(CONTRACT_ADDRESSES.SHARE, MINING_RIG_SHARE_ABI, signer);

        console.log('Initialized contracts:',ownership, share);

        setOwnershipContract(ownership);
        setShareContract(share);

        // Set up event listeners
        setupEventListeners(ownership, share);

        // Load initial contract state
        refreshContractState();
      } catch (error) {
        console.error('Failed to initialize contracts:', error);
        addLog({
          type: 'error',
          message: 'Failed to initialize contracts. Please check contract addresses and network.',
        });
      }
    }
  }, [signer, provider, account]);

  const setupEventListeners = (ownership: ethers.Contract, share: ethers.Contract) => {
    // Listen to events on the ownership contract (MiningRigOwnership)
    ownership.on('SharesBought', (buyer, amount, totalPaid, event) => {
      addEvent({
        event: 'SharesBought',
        args: { buyer, amount: amount.toString(), totalPaid: ethers.formatEther(totalPaid) },
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
        timestamp: new Date(),
      });
    });

    ownership.on('RewardsClaimed', (claimer, amount, event) => {
      addEvent({
        event: 'RewardsClaimed',
        args: { claimer, amount: ethers.formatEther(amount) },
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
        timestamp: new Date(),
      });
    });

    ownership.on('RewardsDeposited', (depositor, amount, event) => {
      addEvent({
        event: 'RewardsDeposited',
        args: { depositor, amount: ethers.formatEther(amount) },
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
        timestamp: new Date(),
      });
    });

    ownership.on('MiningRigRegistered', (owner, rewardPerShare, claimStartTime, event) => {
      addEvent({
        event: 'MiningRigRegistered',
        args: { owner, rewardPerShare: ethers.formatEther(rewardPerShare), claimStartTime: claimStartTime.toString() },
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
        timestamp: new Date(),
      });
    });
  };

  const addEvent = (event: ContractEvent) => {
    setEvents(prev => [event, ...prev].slice(0, 50)); // Keep last 50 events
  };

  const refreshContractState = async () => {
   
    console.log('Refreshing contract state...');
    console.log('Ownership Contract:', ownershipContract);
    console.log('Share Contract:', shareContract);
    console.log('Account:', account);

    if (!shareContract || !ownershipContract || !account) {
      console.warn('Contracts or account not initialized');
      return;
    }
    console.log('Contracts and account are initialized, proceeding to fetch state.');

    setIsLoading(true);
    try {
      const owner = await ownershipContract.owner();
      console.log('Contract owner:', owner);
      const [
        totalShares,
        shareId,
        registerInfo,
        userInfo,
      ] = await Promise.all([
        shareContract.TOTAL_SHARES(),
        shareContract.SHARE_ID(),
        ownershipContract.registerMiningInfo(owner),
        ownershipContract.userInfo(account),
      ]);

      setContractState({
        totalShares: Number(totalShares),
        shareId: Number(shareId),
        sharesRemaining: Number(registerInfo.remainingShares),
        maxCapPerWallet: Number(await ownershipContract.CAP_PER_WALLET()),
        pricePerShare: ethers.formatEther(registerInfo.perShareValue),
        totalDepositedRewards: ethers.formatEther(registerInfo.depositedRewards),
        rewardPerShare: ethers.formatEther(registerInfo.rewardPerShare),
        userShares: Number(userInfo.sharesBought),
        claimablePeriod: Number(userInfo.claimTimestamp),
        claimableAmount: Number(userInfo.sharesBought) * Number(registerInfo.rewardPerShare),
        hasClaimedRewards: userInfo.hasRewardClaimed,
      });
    } catch (error: any) {
      console.error('Failed to refresh contract state:', error);
      addLog({
        type: 'error',
        message: `Failed to load contract state: ${error.message || 'Unknown error'}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addLog = (log: Omit<TransactionLog, 'id' | 'timestamp'>) => {
    const newLog: TransactionLog = {
      ...log,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setLogs(prev => [newLog, ...prev].slice(0, 100)); // Keep last 100 logs
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <ContractContext.Provider
      value={{
        ownershipContract,
        shareContract,
        contractState,
        contractAddresses: CONTRACT_ADDRESSES,
        logs,
        events,
        isLoading,
        refreshContractState,
        addLog,
        clearLogs,
      }}
    >
      {children}
    </ContractContext.Provider>
  );
};

export const useContract = () => {
  const context = useContext(ContractContext);
  if (context === undefined) {
    throw new Error('useContract must be used within a ContractProvider');
  }
  return context;
};