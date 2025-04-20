'use client';

import { useEffect } from 'react';
import { FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Error occurred:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass-card p-8 rounded-2xl border border-card-border shadow-float backdrop-blur-sm"
      >
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full bg-red-900/30">
          <FaExclamationTriangle className="text-red-400" size={24} />
        </div>
        
        <h1 className="text-xl text-center font-bold text-foreground mb-2">Something went wrong</h1>
        <p className="text-foreground-secondary text-center mb-6">
          We've encountered an error while processing your request. Please try again or go back to the home page.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm flex items-center justify-center"
          >
            Try Again
          </button>
          
          <a 
            href="/"
            className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg text-sm flex items-center justify-center"
          >
            <FaArrowLeft className="mr-2" size={12} />
            Go Home
          </a>
        </div>
      </motion.div>
    </div>
  );
} 