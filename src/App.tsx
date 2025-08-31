import React, { useState } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Tabs,
  Tab,
  Box,
  Grid,
} from '@mui/material';
import { WalletProvider } from './contexts/WalletContext';
import { ContractProvider } from './contexts/ContractContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ContractStatus } from './components/ContractStatus';
import { BuyShares } from './components/BuyShares';
import { ClaimRewards } from './components/ClaimRewards';
import { DepositRewards } from './components/DepositRewards';
import { TransferShares } from './components/TransferShares';
import { AdminPanel } from './components/AdminPanel';
import { EventLogs } from './components/EventLogs';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#9c27b0',
    },
    success: {
      main: '#2e7d32',
    },
    warning: {
      main: '#ed6c02',
    },
    error: {
      main: '#d32f2f',
    },
  },
  typography: {
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          transition: 'all 0.2s ease-in-out',
        },
      },
    },
  },
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const App: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <WalletProvider>
        <ContractProvider>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            
            <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
              <ContractStatus />
              
              <Box sx={{ mt: 4 }}>
                <Tabs 
                  value={tabValue} 
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{ 
                    borderBottom: 1, 
                    borderColor: 'divider',
                    mb: 2,
                    '& .MuiTab-root': {
                      fontWeight: 500,
                      textTransform: 'none',
                    }
                  }}
                >
                  <Tab label="Buy Shares" />
                  <Tab label="Claim Rewards" />
                  <Tab label="Transfer Shares" />
                  <Tab label="Deposit Rewards" />
                  <Tab label="Admin" />
                  <Tab label="Logs & Events" />
                </Tabs>

                <TabPanel value={tabValue} index={0}>
                  <BuyShares />
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  <ClaimRewards />
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                  <TransferShares />
                </TabPanel>

                <TabPanel value={tabValue} index={3}>
                  <DepositRewards />
                </TabPanel>

                <TabPanel value={tabValue} index={4}>
                  <AdminPanel />
                </TabPanel>

                <TabPanel value={tabValue} index={5}>
                  <EventLogs />
                </TabPanel>
              </Box>
            </Container>

            <Footer />
          </Box>
        </ContractProvider>
      </WalletProvider>
    </ThemeProvider>
  );
};

export default App;