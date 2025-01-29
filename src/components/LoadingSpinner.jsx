import React from 'react';
import Logo from '../assets/logo.png';

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-purple-900 to-indigo-800">
      {/* Animated Logo */}
      <div className="relative w-32 h-32">
        <img
          src={Logo}
          alt="Game Portal Logo"
          className="w-full h-full animate-bounce-slow"
        />
        {/* Glow Effect */}
        <div className="absolute inset-0 rounded-full bg-white opacity-0 animate-pulse-glow"></div>
      </div>

      {/* Loading Text with Animation */}
      <div className="mt-8 flex space-x-2">
        {['L', 'O', 'A', 'D', 'I', 'N', 'G', '.', '.', '.'].map((char, index) => (
          <span
            key={index}
            className="text-2xl font-bold text-white animate-wave"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  );
};

export default LoadingSpinner;