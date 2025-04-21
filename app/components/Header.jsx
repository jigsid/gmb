import { useState, useEffect } from 'react';
import { FaChartLine, FaQuestionCircle, FaGithub, FaBuilding, FaStar, FaRocket, FaArrowRight } from 'react-icons/fa';
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
      className={`sticky top-0 z-50 w-full backdrop-blur-xl transition-all duration-300 border-b border-gray-800/50 bg-gray-900/80 ${
        scrolled ? 'py-2 shadow-lg shadow-black/10' : 'py-3'
      }`}
    >
      <div className="container-fluid flex items-center justify-between">
        {/* Logo/Brand - constrained to ~20% */}
        <div className="w-1/5 min-w-[160px] flex-shrink-0">
          <Link href="/">
            <motion.div 
              className="flex items-center cursor-pointer group"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleLogoClick}
            >
              <div className="relative w-9 h-9 mr-2.5">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 shadow-lg group-hover:from-primary-400 group-hover:to-secondary-400 transition-all duration-300 overflow-hidden">
                  <div className="absolute -inset-1 bg-gradient-to-tr from-primary-400/30 to-transparent blur-sm group-hover:opacity-80 transition-opacity"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <FaBuilding className="text-white z-10" size={14} />
                  <FaChartLine className="text-white absolute right-1 bottom-1 z-10" size={10} />
                </div>
              </div>
              <div className="max-w-[140px] truncate">
                <motion.h1 
                  className="text-base font-bold text-white truncate"
                  whileHover={{ color: '#3d8eff' }}
                  transition={{ duration: 0.2 }}
                >
                  
                </motion.h1>
                <p className="text-[17px] text-primary-400 truncate font-medium group-hover:text-primary-300 transition-colors">
                  {isResultsMode ? "Click to start over" : "Bizz"}
                </p>
              </div>
            </motion.div>
          </Link>
        </div>
        
        {/* Navigation - flexible middle section */}
        <nav className="hidden md:flex items-center justify-center flex-grow space-x-3">
          <NavLink href="#features" label="Features" icon={<FaStar size={10} />} />
          <NavLink href="#how-it-works" label="How It Works" icon={<FaRocket size={10} />} />
          <NavLink href="#pricing" label="Pricing" />
          <NavLink href="#faq" label="FAQ" />
        </nav>
        
        {/* Actions - constrained right section */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <motion.a
            href="https://github.com/jigsid/gmb"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full text-gray-300 hover:text-primary-400 hover:bg-gray-800/50 transition-colors"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaGithub size={16} />
          </motion.a>
          
          <motion.a
            href="#help"
            className="p-2 rounded-full text-gray-300 hover:text-primary-400 hover:bg-gray-800/50 transition-colors"
            whileHover={{ scale: 1.1, rotate: -5 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaQuestionCircle size={16} />
          </motion.a>
          
          <Link href="/">
            <motion.button
              className="ml-1 px-5 py-2 rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium shadow-md hover:shadow-lg transition-all glow-effect"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="flex items-center text-white font-semibold text-sm">
                Get Started <FaArrowRight className="ml-1" size={10} />
              </span>
            </motion.button>
          </Link>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, label, icon }) {
  return (
    <motion.a
      href={href}
      className="px-3 py-2 rounded-lg text-sm text-gray-200 hover:text-primary-400 hover:bg-gray-800/50 transition-colors relative group font-medium"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="flex items-center">
        {icon && <span className="mr-1.5 opacity-70 group-hover:opacity-100">{icon}</span>}
        {label}
      </div>
      <motion.span
        className="absolute bottom-1 left-3 right-3 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 opacity-0 transform scale-x-0 origin-left transition-transform rounded-full"
        initial={{ scaleX: 0, opacity: 0 }}
        whileHover={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.a>
  );
} 