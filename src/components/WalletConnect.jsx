import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { User, LogOut, Copy, ExternalLink, Package, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import MetaMaskSDK from '@metamask/sdk';
import SellerProducts from './SellerProducts';

export default function WalletConnect({ onConnect }) {
  const [account, setAccount] = useState('');
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [sdk, setSDK] = useState(null);
  const [copied, setCopied] = useState(false);

  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const init = async () => {
      try {
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

  const checkAndRestoreConnection = async (ethereum) => {
    try {
      const storedData = localStorage.getItem('walletData');
      if (storedData) {
        const { address, timestamp } = JSON.parse(storedData);
        const isValid = Date.now() - timestamp < 24 * 60 * 60 * 1000;

        if (isValid) {
          const accounts = await ethereum.request({
            method: 'eth_accounts',
          });

          if (accounts.length > 0 && accounts[0].toLowerCase() === address.toLowerCase()) {
            const chainId = await ethereum.request({ method: 'eth_chainId' });
            if (chainId === '0x1') {
              setAccount(accounts[0]);
              onConnect(accounts[0]);
              return;
            }
          }
        }
      }
      localStorage.removeItem('walletData');
    } catch (error) {
      console.error('Connection restoration error:', error);
      handleLogout();
    }
  };

  useEffect(() => {
    if (!isInitialized || !window.ethereum) return;

    const handleAccountsChanged = async (accounts) => {
      if (accounts.length === 0) {
        handleLogout();
      } else {
        const newAccount = accounts[0];
        setAccount(newAccount);
        onConnect(newAccount);
        localStorage.setItem('walletData', JSON.stringify({
          address: newAccount,
          timestamp: Date.now()
        }));
      }
    };

    const handleChainChanged = (chainId) => {
      const supportedChains = ['0x1'];
      if (!supportedChains.includes(chainId)) {
        alert('Please switch to a supported network');
        handleLogout();
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('connect', ({ chainId }) => console.log('Connected to:', chainId));
    window.ethereum.on('disconnect', (error) => {
      console.log('Disconnected:', error);
      handleLogout();
    });

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('connect', () => {});
        window.ethereum.removeListener('disconnect', () => {});
      }
    };
  }, [isInitialized]);

  const connectWallet = async () => {
    if (!window.ethereum) {
      if (isMobile()) {
        const dappUrl = window.location.href;
        const metamaskAppDeepLink = `https://metamask.app.link/dapp/${dappUrl}`;
        window.location.href = metamaskAppDeepLink;
        return;
      }
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== '0x1') {
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

  const handleLogout = () => {
    setAccount('');
    onConnect('');
    localStorage.removeItem('walletData');
    setIsOpen(false);
  };

  const ConnectedWalletContent = ({ address }) => {
    const shortenedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
    const explorerUrl = `https://etherscan.io/address/${address}`;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={32} className="text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold mb-1">Connected Wallet</h3>
          <div className="text-gray-500 text-sm mb-4">Your Ethereum wallet is connected</div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-500">Wallet Address</span>
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
            >
              <span>View on Explorer</span>
              <ExternalLink size={14} />
            </a>
          </div>
          <div className="flex items-center justify-between bg-white border rounded-lg p-3">
            <code className="text-sm font-mono">{shortenedAddress}</code>
            <button
              onClick={() => copyToClipboard(address)}
              className={`p-2 rounded-lg transition-colors ${
                copied ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100 text-gray-600'
              }`}
              title="Copy address"
            >
              <Copy size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <SellerProducts walletAddress={address} />
          
          <button
            onClick={handleLogout}
            className="w-full bg-red-50 text-red-600 px-4 py-3 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <LogOut size={18} />
            Disconnect Wallet
          </button>
        </div>
      </div>
    );
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          {account ? (
            <div className="flex items-center space-x-2">
              <User className="text-blue-500" size={24} />
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
        <Dialog.Overlay className="fixed inset-0 bg-black/50 animate-fade-in backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg p-6 w-full max-w-md animate-slide-up">
          <Dialog.Title className="text-xl font-bold mb-6">
            {account ? 'Wallet Connected' : 'Connect Wallet'}
          </Dialog.Title>

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
            <ConnectedWalletContent address={account} />
          )}

          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}