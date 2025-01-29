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

  // Check if the user is on a mobile device
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  };

  // Initialize MetaMask SDK and check for existing connection
  useEffect(() => {
    const init = async () => {
      const MMSDK = new MetaMaskSDK({
        injectProvider: true,
        dappMetadata: {
          name: "Your DApp Name",
          url: window.location.href,
        },
      });

      const ethereum = MMSDK.getProvider();

      if (ethereum) {
        setIsMetaMaskInstalled(true);

        try {
          // Check sessionStorage for a previously connected wallet
          const storedAddress = sessionStorage.getItem('walletAddress');
          if (storedAddress) {
            const provider = new ethers.BrowserProvider(ethereum);
            const accounts = await ethereum.request({
              method: 'eth_accounts',
            });

            if (accounts.length > 0 && accounts[0].toLowerCase() === storedAddress.toLowerCase()) {
              setAccount(accounts[0]);
              onConnect(accounts[0]); // Notify parent component of the connection
            }
          }
        } catch (error) {
          console.error('Error during initialization:', error);
          handleLogout();
        }
      }

      setIsInitialized(true);
    };

    init();
  }, []);

  // Handle account changes, disconnects, and chain changes
  useEffect(() => {
    if (!isInitialized || !window.ethereum) return;

    const handleAccountsChanged = async (accounts) => {
      if (accounts.length === 0) {
        handleLogout(); // Disconnect if no accounts are available
      } else {
        const newAccount = accounts[0];
        setAccount(newAccount);
        onConnect(newAccount); // Notify parent component of the connection
        sessionStorage.setItem('walletAddress', newAccount); // Store the new account in sessionStorage
      }
    };

    const handleDisconnect = () => {
      handleLogout(); // Handle wallet disconnection
    };

    const handleChainChanged = () => {
      window.location.reload(); // Reload the page on chain change
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('disconnect', handleDisconnect);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [isInitialized]);

  // Connect to MetaMask
  const connectWallet = async () => {
    if (!window.ethereum) return;

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const address = accounts[0];
      setAccount(address);
      onConnect(address); // Notify parent component of the connection
      sessionStorage.setItem('walletAddress', address); // Store the address in sessionStorage
      setIsOpen(false); // Close the dialog
    } catch (err) {
      console.error('Connection error:', err);
      handleLogout();
    }
  };

  // Handle wallet logout
  const handleLogout = () => {
    setAccount('');
    onConnect(''); // Notify parent component of the disconnection
    sessionStorage.removeItem('walletAddress'); // Remove the address from sessionStorage
    setIsOpen(false); // Close the dialog
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