import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { User, LogOut } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import MetaMaskSDK from '@metamask/sdk';

export default function WalletConnect({ onConnect }) {
  const [account, setAccount] = useState('');
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [sdk, setSDK] = useState(null);

  // Check if the user is on a mobile device
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  };

  // Initialize MetaMask SDK with improved configuration
  useEffect(() => {
    const init = async () => {
      try {
        const MMSDK = new MetaMaskSDK({
          injectProvider: true,
          dappMetadata: {
            name: "Your DApp Name",
            url: window.location.href,
          },
          // Enable deep linking for mobile
          checkInstallationImmediately: true,
          enableDeeplinks: true,
          // Recommended timeout
          timer: 1000,
          // Optional: Add your preferred network
          defaultNetwork: "ethereum",
        });

        setSDK(MMSDK);
        const ethereum = MMSDK.getProvider();

        if (ethereum) {
          setIsMetaMaskInstalled(true);
          await checkAndRestoreConnection(ethereum);
        }
      } catch (error) {
        console.error('SDK Initialization error:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    init();
  }, []);

  // Check and restore previous connection
  const checkAndRestoreConnection = async (ethereum) => {
    try {
      const storedData = localStorage.getItem('walletData');
      if (storedData) {
        const { address, timestamp } = JSON.parse(storedData);
        
        // Check if the stored connection is less than 24 hours old
        const isValid = Date.now() - timestamp < 24 * 60 * 60 * 1000;
        
        if (isValid) {
          const accounts = await ethereum.request({
            method: 'eth_accounts',
          });

          if (accounts.length > 0 && accounts[0].toLowerCase() === address.toLowerCase()) {
            // Verify the chain ID matches your expected network
            const chainId = await ethereum.request({ method: 'eth_chainId' });
            if (chainId === '0x1') { // Ethereum Mainnet, adjust as needed
              setAccount(accounts[0]);
              onConnect(accounts[0]);
              return;
            }
          }
        }
      }
      // Clear invalid or expired data
      localStorage.removeItem('walletData');
    } catch (error) {
      console.error('Connection restoration error:', error);
      handleLogout();
    }
  };

  // Enhanced event listeners
  useEffect(() => {
    if (!isInitialized || !window.ethereum) return;

    const handleAccountsChanged = async (accounts) => {
      if (accounts.length === 0) {
        handleLogout();
      } else {
        const newAccount = accounts[0];
        setAccount(newAccount);
        onConnect(newAccount);
        
        // Store connection data with timestamp
        localStorage.setItem('walletData', JSON.stringify({
          address: newAccount,
          timestamp: Date.now()
        }));
      }
    };

    const handleChainChanged = (chainId) => {
      // Optional: Check if the new chain is supported
      const supportedChains = ['0x1']; // Add your supported chains
      if (!supportedChains.includes(chainId)) {
        alert('Please switch to a supported network');
        handleLogout();
      }
    };

    const handleConnect = ({ chainId }) => {
      console.log('Wallet connected to chain:', chainId);
    };

    const handleDisconnect = (error) => {
      console.log('Wallet disconnected:', error);
      handleLogout();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('connect', handleConnect);
    window.ethereum.on('disconnect', handleDisconnect);

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('connect', handleConnect);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      }
    };
  }, [isInitialized]);

  // Enhanced wallet connection with network verification
  const connectWallet = async () => {
    if (!window.ethereum) {
      if (isMobile()) {
        // Handle mobile deep linking
        const dappUrl = window.location.href;
        const metamaskAppDeepLink = `https://metamask.app.link/dapp/${dappUrl}`;
        window.location.href = metamaskAppDeepLink;
        return;
      }
      return;
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      // Verify network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== '0x1') { // Ethereum Mainnet, adjust as needed
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x1' }],
          });
        } catch (error) {
          console.error('Failed to switch network:', error);
          return;
        }
      }

      const address = accounts[0];
      setAccount(address);
      onConnect(address);
      
      // Store connection data with timestamp
      localStorage.setItem('walletData', JSON.stringify({
        address,
        timestamp: Date.now()
      }));
      
      setIsOpen(false);
    } catch (err) {
      console.error('Connection error:', err);
      handleLogout();
    }
  };

  // Enhanced logout handling
  const handleLogout = () => {
    setAccount('');
    onConnect('');
    localStorage.removeItem('walletData');
    setIsOpen(false);
  };

  // Rest of your component JSX remains the same...
  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      {/* Your existing JSX */}
    </Dialog.Root>
  );
}