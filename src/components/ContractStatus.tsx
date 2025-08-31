import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Grid,
  LinearProgress,
} from '@mui/material';
import { TrendingUp, AccountBalance, Person, Timer, Tag } from '@mui/icons-material';
import { useContract } from '../contexts/ContractContext';

export const ContractStatus: React.FC = () => {
  const { contractState, isLoading } = useContract();

  const sharesSoldPercentage =
    contractState.totalShares > 0
      ? ((contractState.totalShares - contractState.sharesRemaining) / contractState.totalShares) * 100
      : 0;

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
          Mining Rig Share Overview
        </Typography>

        {isLoading && <LinearProgress sx={{ mb: 2 }} />}

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <Tag color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Share ID
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {contractState.shareId ?? 'N/A'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <TrendingUp color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Total Shares
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {contractState.totalShares}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <AccountBalance color="secondary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Available Shares
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {contractState.sharesRemaining}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <Person color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Your Shares
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {contractState.userShares}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <Timer color="warning" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Max per Wallet
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {contractState.maxCapPerWallet}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Shares Sold Progress
          </Typography>
          <LinearProgress
            variant="determinate"
            value={sharesSoldPercentage}
            sx={{ height: 8, borderRadius: 4, mb: 1 }}
          />
          <Typography variant="caption" color="text.secondary">
            {sharesSoldPercentage.toFixed(1)}% sold
          </Typography>
        </Box>

        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Price per Share
              </Typography>
              <Chip
                label={`${contractState.pricePerShare} ETH`}
                size="small"
                color="primary"
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Total Rewards
              </Typography>
              <Chip
                label={`${contractState.totalDepositedRewards} ETH`}
                size="small"
                color="success"
              />
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};