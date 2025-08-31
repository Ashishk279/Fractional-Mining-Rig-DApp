import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';

interface WalletContextType {
  account: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  isConnected: boolean;
  isOwner: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  chainId: number | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const POLYGON_AMOY_CHAIN_ID = 80002;
const OWNER_ADDRESS = "0xc3AE932229a1bB8D520c4050fbDBcA59a918C05a";

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);

  const isConnected = !!account;
  const isOwner = account?.toLowerCase() === OWNER_ADDRESS.toLowerCase();

  // Function to detect MetaMask provider
  const getMetaMaskProvider = (): any | null => {
    // Check for multiple providers (non-standard, supported in some browsers like Chrome)
    if (window.ethereum && Array.isArray(window.ethereum.providers)) {
      console.log('Multiple wallet providers detected:', window.ethereum.providers);
      const metaMaskProvider = window.ethereum.providers.find((p: any) => p.isMetaMask && !p.isTrust);
      if (metaMaskProvider) {
        console.log('MetaMask provider found in providers array');
        return metaMaskProvider;
      }
      console.warn('MetaMask not found in providers array');
      return null;
    }

    // Fallback to single provider check
    if (window.ethereum && window.ethereum.isMetaMask && !window.ethereum.isTrust) {
      console.log('Single MetaMask provider detected');
      return window.ethereum;
    }

    console.warn('No MetaMask provider detected. Current provider:', window.ethereum);
    return null;
  };

  const connectWallet = async () => {
    const metaMaskProvider = getMetaMaskProvider();
    if (!metaMaskProvider) {
      alert(
        'MetaMask is not detected. Please install MetaMask or disable other wallet extensions (e.g., Trust Wallet, Phantom) and try again.',
      );
      console.error('MetaMask not detected');
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(metaMaskProvider);
      // Request accounts to prompt MetaMask account selection
      const accounts = await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();

      // Ensure the correct network (Polygon Amoy)
      if (Number(network.chainId) !== POLYGON_AMOY_CHAIN_ID) {
        try {
          await metaMaskProvider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${POLYGON_AMOY_CHAIN_ID.toString(16)}` }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            try {
              await metaMaskProvider.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: `0x${POLYGON_AMOY_CHAIN_ID.toString(16)}`,
                    chainName: 'Polygon Amoy',
                    rpcUrls: ['https://rpc-amoy.polygon.technology/'],
                    nativeCurrency: {
                      name: 'MATIC',
                      symbol: 'MATIC',
                      decimals: 18,
                    },
                    blockExplorerUrls: ['https://amoy.polygonscan.com/'],
                  },
                ],
              });
            } catch (addChainError) {
              console.error('Failed to add Polygon Amoy network:', addChainError);
              alert('Failed to add Polygon Amoy network. Please add it manually in MetaMask.');
              return;
            }
          } else {
            console.error('Failed to switch to Polygon Amoy network:', switchError);
            alert('Failed to switch to Polygon Amoy network. Please select it in MetaMask.');
            return;
          }
        }
      }

      console.log('Connected to MetaMask. Account:', accounts[0], 'Chain ID:', Number(network.chainId));
      setProvider(provider);
      setSigner(signer);
      setAccount(accounts[0]);
      setChainId(Number(network.chainId));
    } catch (error: any) {
      console.error('Failed to connect to MetaMask:', error);
      alert(`Failed to connect to MetaMask: ${error.message || 'Unknown error'}. Please ensure MetaMask is installed and unlocked.`);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    console.log('Disconnected wallet');
    // Note: MetaMask does not support programmatic session clearing, but resetting state ensures next connect prompts account selection
  };

  useEffect(() => {
    const metaMaskProvider = getMetaMaskProvider();
    if (metaMaskProvider) {
      const handleAccountsChanged = (accounts: string[]) => {
        console.log('MetaMask accounts changed:', accounts);
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
          // Reconnect with new account
          connectWallet();
        }
      };

      const handleChainChanged = (chainId: string) => {
        const newChainId = parseInt(chainId, 16);
        console.log('MetaMask chain changed:', newChainId);
        setChainId(newChainId);
        if (newChainId === POLYGON_AMOY_CHAIN_ID) {
          // Only reconnect if user explicitly connects
          if (account) {
            connectWallet();
          }
        } else {
          alert('Please switch to the Polygon Amoy network in MetaMask.');
        }
      };

      metaMaskProvider.on('accountsChanged', handleAccountsChanged);
      metaMaskProvider.on('chainChanged', handleChainChanged);

      // Do not auto-connect on initial load
      console.log('WalletProvider initialized, waiting for user to connect wallet');

      return () => {
        metaMaskProvider.removeListener('accountsChanged', handleAccountsChanged);
        metaMaskProvider.removeListener('chainChanged', handleChainChanged);
      };
    } else {
      console.warn('MetaMask not detected on initial load');
      alert('MetaMask is not detected. Please install MetaMask or disable other wallet extensions.');
    }
  }, []);

  return (
    <WalletContext.Provider
      value={{
        account,
        provider,
        signer,
        isConnected,
        isOwner,
        connectWallet,
        disconnectWallet,
        chainId,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

declare global {
  interface Window {
    ethereum: any & {
      providers?: any[];
      isMetaMask?: boolean;
      isTrust?: boolean;
    };
  }
}