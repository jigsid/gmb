import { useState, useEffect } from 'react';
import { FaChartLine, FaQuestionCircle, FaGithub, FaBuilding } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Header({ currentStep, onReset }) {
  const [scrolled, setScrolled] = useState(false);
  
  // Only handle scroll events
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Listen for scroll events
      const handleScroll = () => {
        setScrolled(window.scrollY > 10);
      };
      
      window.addEventListener('scroll', handleScroll);
      
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  // Check if we're in results mode
  const isResultsMode = currentStep === 'results';
  
  // Handle logo click to reset form if in results mode
  const handleLogoClick = (e) => {
    if (isResultsMode && onReset) {
      e.preventDefault();
      onReset();
    }
  };
  
  return (
    <header 
      className={`sticky top-0 z-50 w-full backdrop-blur-md transition-all duration-200 border-b border-card-border bg-gray-900/80 ${
        scrolled ? 'py-2 shadow-sm' : 'py-3'
      }`}
    >
      <div className="container-fluid flex items-center justify-between">
        {/* Logo/Brand - constrained to ~20% */}
        <div className="w-1/5 min-w-[160px] flex-shrink-0">
          <Link href="/">
            <motion.div 
              className="flex items-center cursor-pointer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleLogoClick}
            >
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 mr-2.5 shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 rounded-lg"></div>
                <div className="absolute -inset-1 bg-gradient-to-tr from-primary-600/20 to-transparent blur-sm"></div>
                <FaBuilding className="text-white relative z-10" size={16} />
                <FaChartLine className="text-white absolute right-1 bottom-1 z-10" size={10} />
              </div>
              <div className="max-w-[140px] truncate">
                <h1 className="text-base font-bold text-white truncate">BC</h1>
                <p className="text-[11px] text-primary-400 truncate font-medium">
                  {isResultsMode ? "Click to start over" : "Comparison & Analytics"}
                </p>
              </div>
            </motion.div>
          </Link>
        </div>
        
        {/* Navigation - flexible middle section */}
        <motion.nav 
          className="hidden md:flex items-center justify-center flex-grow space-x-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <NavLink href="#features" label="Features" />
          <NavLink href="#how-it-works" label="How It Works" />
          <NavLink href="#pricing" label="Pricing" />
          <NavLink href="#faq" label="FAQ" />
        </motion.nav>
        
        {/* Actions - constrained right section */}
        <motion.div 
          className="flex items-center space-x-2 flex-shrink-0"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.a
            href="https://github.com/username/business-comparison-tool"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full text-gray-300 hover:text-primary-400 hover:bg-neutral-800 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaGithub size={16} />
          </motion.a>
          
          <motion.a
            href="#help"
            className="p-2 rounded-full text-gray-300 hover:text-primary-400 hover:bg-neutral-800 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaQuestionCircle size={16} />
          </motion.a>
          
          <Link href="/">
            <motion.button
              className="ml-1 px-4 py-2 rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium shadow-md hover:shadow-lg transition-shadow"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="text-white font-semibold text-sm">Get Started</span>
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </header>
  );
}

function NavLink({ href, label }) {
  return (
    <motion.a
      href={href}
      className="px-3 py-2 rounded-lg text-sm text-gray-200 hover:text-primary-400 hover:bg-neutral-800 transition-colors relative group font-medium"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {label}
      <motion.span
        className="absolute bottom-1 left-3 right-3 h-0.5 bg-primary-500 opacity-0 transform scale-x-0 origin-left transition-transform"
        initial={{ scaleX: 0, opacity: 0 }}
        whileHover={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.a>
  );
} 