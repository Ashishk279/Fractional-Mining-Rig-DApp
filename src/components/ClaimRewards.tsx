import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Alert,
  Chip,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import { AttachMoney, Timer } from '@mui/icons-material';
import { useWallet } from '../contexts/WalletContext';
import { useContract } from '../contexts/ContractContext';

export const ClaimRewards: React.FC = () => {
  const { isConnected } = useWallet();
  const { ownershipContract, contractState, addLog, refreshContractState } = useContract();
  const [isLoading, setIsLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    if (contractState.claimablePeriod > 0) {
      const interval = setInterval(() => {
        const remaining = contractState.claimablePeriod - Math.floor(Date.now() / 1000);
        setTimeRemaining(Math.max(0, remaining));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [contractState.claimablePeriod]);

  const formatTime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const canClaim = isConnected && 
    contractState.userShares > 0 && 
    timeRemaining === 0 && 
    Number(contractState.claimableAmount) > 0;

  const handleClaimRewards = async () => {
    if (!ownershipContract || !canClaim) return;

    console.log("DDD", ownershipContract, canClaim)

    setIsLoading(true);
    try {
      addLog({ type: 'pending', message: 'Claiming rewards...' });
      
      const tx = await ownershipContract.claimRewards();
      console.log("Transaction submitted:" , tx)
      
      addLog({ 
        type: 'pending', 
        message: `Transaction submitted: ${tx.hash}`,
        txHash: tx.hash 
      });

      const receipt = await tx.wait();
      
      addLog({
        type: 'success',
        message: `Successfully claimed ${contractState.claimableAmount} ETH in rewards!`,
        txHash: receipt.hash,
      });

      await refreshContractState();
    } catch (error: any) {
      addLog({
        type: 'error',
        message: `Failed to claim rewards: ${error.reason || error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardContent>
          <Alert severity="warning">
            Please connect your wallet to view and claim rewards.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          Claim Rewards
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Your Shares
            </Typography>
            <Chip label={contractState.userShares} color="primary" size="small" />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Reward per Share
            </Typography>
            <Chip 
              label={`${contractState.rewardPerShare} ETH`} 
              color="secondary" 
              size="small" 
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Claimable Amount
            </Typography>
            <Chip 
              label={`${Number(contractState.claimableAmount)} Wei`} 
              color="success" 
              size="small" 
            />
          </Box>
        </Box>

        {timeRemaining > 0 ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Timer />
              <Typography>
                Claim unlocks in: <strong>{formatTime(timeRemaining)}</strong>
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={100 - (timeRemaining / contractState.claimablePeriod) * 100}
              sx={{ mt: 1 }}
            />
          </Alert>
        ) : contractState.hasClaimedRewards ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            You have already claimed your rewards for this period.
          </Alert>
        ) : contractState.userShares === 0 ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            You don't own any shares. Buy shares first to earn rewards.
          </Alert>
        ) : null}

        <Button
          variant="contained"
          onClick={handleClaimRewards}
          disabled={!canClaim || isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : <AttachMoney />}
          fullWidth
          sx={{ 
            py: 1.5,
            backgroundColor: '#2e7d32',
            '&:hover': { backgroundColor: '#1b5e20' },
            '&:disabled': { backgroundColor: '#e0e0e0' }
          }}
        >
          {isLoading ? 'Claiming...' : `Claim ${contractState.claimableAmount} Wei Rewards`}
        </Button>
      </CardContent>
    </Card>
  );
};