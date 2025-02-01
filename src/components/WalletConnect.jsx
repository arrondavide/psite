import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { User, LogOut } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import MetaMaskSDK from '@metamask/sdk';
import SellerProducts from './SellerProducts'; // Add this import at the top

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
        // First check if ethereum object exists in window
        if (typeof window.ethereum !== 'undefined') {
          setIsMetaMaskInstalled(true);
          await checkAndRestoreConnection(window.ethereum);
          setIsInitialized(true);
          return;
        }

        const MMSDK = new MetaMaskSDK({
          injectProvider: true,
          dappMetadata: {
            name: "Your DApp Name",
            url: window.location.href,
          },
          checkInstallationImmediately: true,
          enableDeeplinks: true,
          timer: 1000,
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

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          {account ? (
            <div className="flex items-center space-x-2">
              <User className="text-green-500" size={24} />
              <span className="text-sm text-gray-600">
                {`${account.slice(0, 6)}...${account.slice(-4)}`}
              </span>
            </div>
          ) : (
            <User size={24} className="text-gray-600" />
          )}
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 animate-fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-md animate-slide-up">
          <Dialog.Title className="text-xl font-bold mb-4">
            {account ? 'Wallet Connected' : 'Connect Wallet'}
          </Dialog.Title>

          <div className="space-y-6">
            {!isMetaMaskInstalled && !isMobile() ? (
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">MetaMask Required</h3>
                <p className="text-gray-600 mb-6">
                  To connect your wallet, you'll need to install MetaMask first.
                </p>
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-orange-500 text-white px-6 py-3 rounded-lg inline-block hover:bg-orange-600 transition-colors"
                >
                  Install MetaMask
                </a>
                <p className="mt-4 text-sm text-gray-500">
                  After installing, refresh this page
                </p>
              </div>
            ) : !account ? (
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">Connect with MetaMask</h3>
                <p className="text-gray-600 mb-6">
                  Connect your MetaMask wallet to access your account.
                </p>
                <button
                  onClick={connectWallet}
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors w-full flex items-center justify-center space-x-2"
                >
                  <span>Connect MetaMask</span>
                </button>
              </div>
            ) : (
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Connected Wallet</h3>
                <p className="text-gray-600 break-all mb-6">{account}</p>
                {account && (
                  <div className="mt-4 border-t pt-4">
                    <SellerProducts walletAddress={account} />
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors w-full flex items-center justify-center space-x-2"
                >
                  <LogOut size={20} />
                  <span>Disconnect Wallet</span>
                </button>
              </div>
            )}
          </div>

          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              ×
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}