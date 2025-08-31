import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Chip } from '@mui/material';
import { AccountBalanceWallet, Power } from '@mui/icons-material';
import { useWallet } from '../contexts/WalletContext';

export const Navbar: React.FC = () => {
  const { account, isConnected, connectWallet, disconnectWallet, chainId, isOwner } = useWallet();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
          Mining Rig Share Management
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {chainId && chainId !== 80002 && (
            <Chip 
              label="Wrong Network" 
              color="error" 
              size="small"
              sx={{ color: 'white' }}
            />
          )}
          
          {isOwner && (
            <Chip 
              label="Owner" 
              color="secondary" 
              size="small"
              sx={{ backgroundColor: '#f50057', color: 'white' }}
            />
          )}

          {isConnected ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                icon={<AccountBalanceWallet sx={{ color: 'white !important' }} />}
                label={formatAddress(account!)}
                variant="outlined"
                sx={{ 
                  color: 'white',
                  borderColor: 'white',
                  '& .MuiChip-icon': { color: 'white' }
                }}
              />
              <Button
                color="inherit"
                onClick={disconnectWallet}
                startIcon={<Power />}
                sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
                }}
              >
                Disconnect
              </Button>
            </Box>
          ) : (
            <Button
              color="inherit"
              onClick={connectWallet}
              startIcon={<AccountBalanceWallet />}
              variant="outlined"
              sx={{ 
                borderColor: 'white',
                color: 'white',
                '&:hover': { 
                  borderColor: 'white', 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)' 
                }
              }}
            >
              Connect Wallet
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};