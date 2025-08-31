import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Chip,
  CircularProgress,
  Grid
} from '@mui/material';

import { ShoppingCart } from '@mui/icons-material';
import { ethers } from "ethers";
import { useWallet } from '../contexts/WalletContext';
import { useContract } from '../contexts/ContractContext';

export const BuyShares: React.FC = () => {
  const { isConnected, account, signer } = useWallet();
  const { ownershipContract, contractState, addLog, refreshContractState } = useContract();
  const [amount, setAmount] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalCost = (BigInt(amount) * ethers.parseEther(contractState.pricePerShare)).toString();
  const canBuy =
    isConnected &&
    amount > 0 &&
    !isNaN(amount) &&
    amount <= contractState.sharesRemaining &&
    (contractState.userShares + amount) <= contractState.maxCapPerWallet;

  const handleBuyShares = async () => {
    if (!ownershipContract || !signer || !canBuy) {
      setError('Missing required components or invalid share amount');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      addLog({ type: 'pending', message: `Buying ${amount} shares...` });
      const pricePerShareWei = ethers.parseEther(contractState.pricePerShare);
      const totalCostWei = pricePerShareWei * BigInt(amount);
      console.log('Buying shares:', {
        amount,
        pricePerShareWei: pricePerShareWei.toString(),
        totalCostWei: totalCostWei.toString(),
        signer: signer.address,
      });

      
      const totalCostInNumber = Number(totalCostWei)
      console.log('Total cost in number:', totalCostInNumber);

      console.log('Calling buyShares with:', {
        amount,
        shareId: contractState.shareId,
        value: totalCostInNumber,
      });


      const tx = await ownershipContract.buyShares(amount, contractState.shareId, {
        value: totalCostInNumber,
        gasLimit: 200000,
      });
      const receipt = await tx.wait();
      console.log('Transaction submitted:', tx);

      addLog({
        type: 'pending',
        message: `Transaction submitted: ${tx.hash}`,
        txHash: tx.hash,
      });

      // const receipt = await tx.wait();

      addLog({
        type: 'success',
        message: `Successfully bought ${amount} shares!`,
        txHash: receipt.hash,
      });

      setAmount(1);
      await refreshContractState();
    } catch (error: any) {
      const errorMessage = error.reason || error.message || 'Transaction failed';
      setError(errorMessage);
      addLog({
        type: 'error',
        message: `Failed to buy shares: ${errorMessage}`,
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
            Please connect your wallet to buy shares.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          Buy Mining Rig Shares
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Available Shares
              </Typography>
              <Chip
                label={contractState.sharesRemaining}
                color="primary"
                size="small"
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Price per Share
              </Typography>
              <Chip
                label={`${contractState.pricePerShare} ETH`}
                color="secondary"
                size="small"
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Your Shares
              </Typography>
              <Chip
                label={contractState.userShares}
                color="success"
                size="small"
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Max per Wallet
              </Typography>
              <Chip
                label={contractState.maxCapPerWallet}
                color="default"
                size="small"
              />
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mb: 3 }}>
          <TextField
            label="Number of Shares"
            type="number"
            value={amount}
            onChange={(e) => {
              setAmount(Math.max(1, parseInt(e.target.value) || 1));
              setError(null);
            }}
            inputProps={{ min: 1, max: contractState.maxCapPerWallet - contractState.userShares }}
            fullWidth
            sx={{ mb: 2 }}
          />

          <Typography variant="body1" sx={{ mb: 1 }}>
            Total Cost: <strong>{totalCost} Wei</strong>
          </Typography>
        </Box>

        {!canBuy && isConnected && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {amount > contractState.sharesRemaining
              ? "Not enough shares available"
              : (contractState.userShares + amount) > contractState.maxCapPerWallet
                ? "Exceeds maximum shares per wallet"
                : "Invalid amount"}
          </Alert>
        )}

        <Button
          variant="contained"
          onClick={handleBuyShares}
          disabled={!canBuy || isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : <ShoppingCart />}
          fullWidth
          sx={{
            py: 1.5,
            backgroundColor: '#1976d2',
            '&:hover': { backgroundColor: '#1565c0' },
          }}
        >
          {isLoading ? 'Buying...' : `Buy ${amount} Share${amount > 1 ? 's' : ''}`}
        </Button>
      </CardContent>
    </Card>
  );
};