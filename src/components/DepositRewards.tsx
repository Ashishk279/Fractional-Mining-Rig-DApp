import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { AccountBalance } from '@mui/icons-material';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import { useContract } from '../contexts/ContractContext';

export const DepositRewards: React.FC = () => {
  const { isConnected, isOwner, signer } = useWallet();
  const { ownershipContract, contractState, addLog, refreshContractState } = useContract();
  const [amount, setAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDeposit = isOwner && isConnected && parseFloat(amount) > 0 && !isNaN(parseFloat(amount));

  const handleDepositRewards = async () => {
    if (!ownershipContract || !signer || !canDeposit) {
      setError('Missing required components or invalid deposit amount');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      addLog({ type: 'pending', message: `Depositing ${amount} ETH as rewards...` });
      console.log('Preparing to deposit rewards:', amount);

      const tx = await ownershipContract.depositRewards({
        value: amount,
        gasLimit: 200000,
      });

      console.log('Transaction submitted:', tx);

      addLog({
        type: 'pending',
        message: `Transaction submitted: ${tx.hash}`,
        txHash: tx.hash,
      });

      const receipt = await tx.wait();

      addLog({
        type: 'success',
        message: `Successfully deposited ${amount} ETH as rewards!`,
        txHash: receipt.hash,
      });

      setAmount('');
      await refreshContractState();
    } catch (error: any) {
      const errorMessage = error.reason || error.message || 'Transaction failed';
      setError(errorMessage);
      addLog({
        type: 'error',
        message: `Failed to deposit rewards: ${errorMessage}`,
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
            Please connect your wallet to access this feature.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!isOwner) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">
            This feature is only available to the contract owner.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          Deposit Rewards (Owner Only)
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Total Deposited Rewards: {contractState.totalDepositedRewards} ETH
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Current Reward per Share: {contractState.rewardPerShare} ETH
          </Typography>
        </Box>

        <TextField
          label="Amount to Deposit (Wei)"
          type="number"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            setError(null);
          }}
          inputProps={{ min: 0, step: 0.001 }}
          fullWidth
          sx={{ mb: 3 }}
          helperText="Enter the amount of ETH to deposit as rewards for shareholders"
        />

        <Button
          variant="contained"
          onClick={handleDepositRewards}
          disabled={!canDeposit || isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : <AccountBalance />}
          fullWidth
          sx={{
            py: 1.5,
            backgroundColor: '#ed6c02',
            '&:hover': { backgroundColor: '#e65100' },
          }}
        >
          {isLoading ? 'Depositing...' : `Deposit ${amount || '0'} ETH`}
        </Button>
      </CardContent>
    </Card>
  );
};