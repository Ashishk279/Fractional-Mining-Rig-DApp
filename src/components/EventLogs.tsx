import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  Button,
  Divider,
} from '@mui/material';
import { History, Clear, OpenInNew } from '@mui/icons-material';
import { useContract } from '../contexts/ContractContext';

export const EventLogs: React.FC = () => {
  const { events, logs, clearLogs } = useContract();

  const getEventColor = (eventName: string) => {
    switch (eventName) {
      case 'SharesBought': return 'primary';
      case 'RewardsClaimed': return 'success';
      case 'RewardsDeposited': return 'warning';
      case 'MiningRigRegistered': return 'secondary';
      case 'TransferSingle': return 'info';
      default: return 'default';
    }
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'pending': return 'warning';
      case 'info': return 'info';
      default: return 'default';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString();
  };

  const openTransaction = (txHash: string) => {
    window.open(`https://sepolia.arbiscan.io/tx/${txHash}`, '_blank');
  };

  return (
    <Box>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <History sx={{ mr: 1 }} />
              <Typography variant="h6">
                Transaction Logs
              </Typography>
            </Box>
            {logs.length > 0 && (
              <Button
                size="small"
                onClick={clearLogs}
                startIcon={<Clear />}
                color="error"
              >
                Clear Logs
              </Button>
            )}
          </Box>

          {logs.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No transaction logs yet.
            </Typography>
          ) : (
            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
              {logs.map((log) => (
                <ListItem key={log.id} sx={{ py: 1 }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label={log.type} 
                          size="small" 
                          color={getLogColor(log.type) as any}
                        />
                        <Typography variant="body2">
                          {log.message}
                        </Typography>
                        {log.txHash && (
                          <Button
                            size="small"
                            onClick={() => openTransaction(log.txHash!)}
                            endIcon={<OpenInNew />}
                          >
                            View
                          </Button>
                        )}
                      </Box>
                    }
                    secondary={formatTimestamp(log.timestamp)}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Contract Events
          </Typography>

          {events.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No contract events detected yet.
            </Typography>
          ) : (
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {events.map((event, index) => (
                <ListItem key={index} sx={{ py: 1 }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Chip 
                          label={event.event} 
                          size="small" 
                          color={getEventColor(event.event) as any}
                        />
                        <Typography variant="body2">
                          Block #{event.blockNumber}
                        </Typography>
                        <Button
                          size="small"
                          onClick={() => openTransaction(event.transactionHash)}
                          endIcon={<OpenInNew />}
                        >
                          View Tx
                        </Button>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" display="block">
                          {formatTimestamp(event.timestamp)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {JSON.stringify(event.args, null, 2)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};