'use client';

import Link from 'next/link';
import { FaSearchMinus, FaHome } from 'react-icons/fa';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full p-8 rounded-2xl border border-neutral-800 bg-neutral-900 shadow-lg">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full bg-neutral-800">
          <FaSearchMinus className="text-neutral-400" size={24} />
        </div>
        
        <h1 className="text-2xl text-center font-bold text-white mb-2">Page Not Found</h1>
        <p className="text-neutral-400 text-center mb-6">
          The page you are looking for does not exist or has been moved.
        </p>
        
        <div className="flex justify-center">
          <Link 
            href="/"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center"
          >
            <FaHome className="mr-2" size={14} />
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 