'use client';

import { FaExclamationTriangle, FaSyncAlt } from 'react-icons/fa';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function GlobalError({ error, reset }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased bg-gray-950 text-white`}>
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-gray-900 p-8 rounded-xl border border-gray-800 shadow-lg">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full bg-red-900/30">
              <FaExclamationTriangle className="text-red-400" size={24} />
            </div>
            
            <h1 className="text-xl text-center font-bold mb-2">Application Error</h1>
            <p className="text-gray-400 text-center mb-6">
              We've encountered a critical error. Please try reloading the application.
            </p>
            
            <div className="flex justify-center">
              <button
                onClick={() => reset()}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center text-white"
              >
                <FaSyncAlt className="mr-2 animate-spin" size={14} />
                Reload Application
              </button>
            </div>
          </div>
          
          <div className="mt-10 text-gray-500 text-sm text-center">
            © {new Date().getFullYear()} Business Comparison Tool • All rights reserved
          </div>
        </div>
      </body>
    </html>
  );
} 