import React from 'react';
import Logo from '../assets/logo.png';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin-slow">
        <img src={Logo} alt="Game Portal Logo" className="w-16 h-16" />
      </div>
      <h2 className="ml-4 text-2xl font-bold text-white">Loading...</h2>
    </div>
  );
};

export default LoadingSpinner;