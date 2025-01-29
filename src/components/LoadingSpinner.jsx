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
          className="w-full h-full animate-bounce"
          style={{ animationDuration: '3s' }}
        />
        {/* Glow Effect */}
        <div
          className="absolute inset-0 rounded-full shadow-lg"
          style={{
            boxShadow: '0 0 20px 5px rgba(255, 255, 255, 0.6)',
            animation: 'pulse 2s infinite',
          }}
        ></div>
      </div>

      {/* Loading Text with Animation */}
      <div className="mt-8 space-x-2 flex">
        {['L', 'O', 'A', 'D', 'I', 'N', 'G', '.', '.', '.'].map((char, index) => (
          <span
            key={index}
            className="text-3xl font-bold text-white"
            style={{
              animation: 'wave 1.5s infinite',
              animationDelay: `${index * 0.1}s`,
            }}
          >
            {char}
          </span>
        ))}
      </div>

      {/* Inline CSS for Animations */}
      <style>
        {`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          @keyframes wave {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
        `}
      </style>
    </div>
  );
};

export default LoadingSpinner;