import { FaSearchMinus, FaHome } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass-card p-8 rounded-2xl border border-card-border shadow-float backdrop-blur-sm"
      >
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full bg-neutral-800">
          <FaSearchMinus className="text-neutral-400" size={24} />
        </div>
        
        <h1 className="text-2xl text-center font-bold text-foreground mb-2">Page Not Found</h1>
        <p className="text-foreground-secondary text-center mb-6">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex justify-center">
          <Link 
            href="/"
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm flex items-center"
          >
            <FaHome className="mr-2" size={14} />
            Return to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
} 