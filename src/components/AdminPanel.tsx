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
  Divider,
} from '@mui/material';
import { Settings, Add } from '@mui/icons-material';
import { useWallet } from '../contexts/WalletContext';
import { useContract } from '../contexts/ContractContext';

export const AdminPanel: React.FC = () => {
  const { isConnected, isOwner, signer } = useWallet();
  const { ownershipContract, addLog, refreshContractState, shareContract, contractAddresses } = useContract();
  const [rewardPerShare, setRewardPerShare] = useState<string>('');
  const [perShareValue, setPerShareValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canRegister = isOwner && isConnected && rewardPerShare.trim() && perShareValue.trim();

const handleRegisterMiningRig = async () => {
  if (!ownershipContract || !shareContract || !signer || !canRegister) {
    setError('Missing required components or inputs');
    return;
  }

  setIsLoading(true);
  setError(null);
  try {
    addLog({ type: 'pending', message: `Approving contract for token management...` });

    // Check if approval is already set
    console.log('Checking if contract is approved for all...');
    
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


    addLog({ type: 'pending', message: `Registering mining rig...` });
   
    console.log('Registering mining rig with rewardPerShare:', rewardPerShare, 'and perShareValue:', perShareValue);

    // Call registerMiningRig with Wei values
    const tx = await ownershipContract.registerMiningRig(rewardPerShare, perShareValue, {
        gasLimit: 300000,
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
      message: `Successfully registered mining rig!`,
      txHash: receipt.hash,
    });

    setRewardPerShare('');
    setPerShareValue('');
    await refreshContractState();
  } catch (error: any) {
    const errorMessage = error.reason || error.message || 'Transaction failed';
    setError(errorMessage);
    addLog({
      type: 'error',
      message: `Failed to register mining rig: ${errorMessage}`,
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
            Please connect your wallet to access admin features.
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
            This panel is only available to the contract owner.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Settings sx={{ mr: 1 }} />
          <Typography variant="h5" component="h2">
            Admin Panel
          </Typography>
        </Box>

        <Typography variant="h6" gutterBottom>
          Register Mining Rig
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          label="Reward Per Share (ETH)"
          value={rewardPerShare}
          onChange={(e) => {
            setRewardPerShare(e.target.value);
            setError(null);
          }}
          fullWidth
          sx={{ mb: 2 }}
          placeholder="e.g., 0.01"
          type="number"
          inputProps={{ step: '0.000000000000000001', min: 0 }}
        />

        <TextField
          label="Price Per Share (ETH)"
          value={perShareValue}
          onChange={(e) => {
            setPerShareValue(e.target.value);
            setError(null);
          }}
          fullWidth
          sx={{ mb: 3 }}
          placeholder="e.g., 0.1"
          type="number"
          inputProps={{ step: '0.000000000000000001', min: 0 }}
        />

        <Button
          variant="contained"
          onClick={handleRegisterMiningRig}
          disabled={!canRegister || isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : <Add />}
          fullWidth
          sx={{
            py: 1.5,
            backgroundColor: '#d32f2f',
            '&:hover': { backgroundColor: '#c62828' },
          }}
        >
          {isLoading ? 'Registering...' : 'Register Mining Rig'}
        </Button>

        <Divider sx={{ my: 3 }} />

        <Alert severity="info">
          As the owner, you can also deposit rewards using the "Deposit Rewards" tab.
        </Alert>
      </CardContent>
    </Card>
  );
};