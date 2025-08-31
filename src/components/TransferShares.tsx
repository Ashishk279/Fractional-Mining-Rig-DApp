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
import { Send } from '@mui/icons-material';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import { useContract } from '../contexts/ContractContext';

export const TransferShares: React.FC = () => {
  const { isConnected, account , signer} = useWallet();
  const { shareContract, ownershipContract, contractState, addLog, refreshContractState , contractAddresses} = useContract();
  const [recipient, setRecipient] = useState<string>('');
  const [amount, setAmount] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);

  const isValidAddress = ethers.isAddress(recipient);
  const canTransfer = isConnected && 
    contractState.userShares > 0 && 
    amount > 0 && 
    amount <= contractState.userShares && 
    isValidAddress &&
    contractState.hasClaimedRewards;

  const handleTransferShares = async () => {
    if (!shareContract || !ownershipContract || !canTransfer || !signer) return;

    setIsLoading(true);
    try {
      addLog({ type: 'pending', message: `Transferring ${amount} shares to ${recipient}...` });
      const isApproved = await shareContract.isApprovedForAll(signer.address, contractAddresses.OWNERSHIP);
    console.log('Is contract approved for all:', isApproved);

    if (!isApproved) {
      const approvalTx = await shareContract.setApprovalForAll(contractAddresses.OWNERSHIP, true, {
        gasLimit: 100000,
      });
      addLog({
        type: 'pending',
        message: `Approval transaction submitted: ${approvalTx.hash}`,
        txHash: approvalTx.hash,
      });
      await approvalTx.wait();
      addLog({ type: 'success', message: `Contract approved successfully!` });
    } else {
      addLog({ type: 'info', message: `Contract already approved for token management` });
    }
      const tx = await ownershipContract.transferToken(account, amount, contractState.shareId);
      console.log("Transaction submitted:" , tx)

      addLog({ 
        type: 'pending', 
        message: `Transaction submitted: ${tx.hash}`,
        txHash: tx.hash 
      });

      const receipt = await tx.wait();
      
      addLog({
        type: 'success',
        message: `Successfully transferred ${amount} shares to ${recipient}!`,
        txHash: receipt.hash,
      });

      setRecipient('');
      setAmount(1);
      await refreshContractState();
    } catch (error: any) {
      addLog({
        type: 'error',
        message: `Failed to transfer shares: ${error.reason || error.message}`,
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
            Please connect your wallet to transfer shares.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (contractState.userShares === 0) {
    return (
      <Card>
        <CardContent>
          <Alert severity="info">
            You don't own any shares to transfer.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!contractState.hasClaimedRewards) {
    return (
      <Card>
        <CardContent>
          <Alert severity="warning">
            You must claim your rewards before transferring shares.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          Transfer Shares
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Your Shares: <strong>{contractState.userShares}</strong>
          </Typography>
        </Box>

        <TextField
          label="Recipient Address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="0x..."
          fullWidth
          sx={{ mb: 2 }}
          error={recipient.length > 0 && !isValidAddress}
          helperText={recipient.length > 0 && !isValidAddress ? "Invalid Ethereum address" : ""}
        />

        <TextField
          label="Number of Shares"
          type="number"
          value={amount}
          onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
          inputProps={{ min: 1, max: contractState.userShares }}
          fullWidth
          sx={{ mb: 3 }}
        />

        {amount > contractState.userShares && (
          <Alert severity="error" sx={{ mb: 2 }}>
            You can't transfer more shares than you own.
          </Alert>
        )}

        <Button
          variant="contained"
          onClick={handleTransferShares}
          disabled={!canTransfer || isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : <Send />}
          fullWidth
          sx={{ 
            py: 1.5,
            backgroundColor: '#9c27b0',
            '&:hover': { backgroundColor: '#7b1fa2' }
          }}
        >
          {isLoading ? 'Transferring...' : `Transfer ${amount} Share${amount > 1 ? 's' : ''}`}
        </Button>
      </CardContent>
    </Card>
  );
};