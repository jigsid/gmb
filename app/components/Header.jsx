import { useState, useEffect } from 'react';
import { FaChartLine, FaMoon, FaSun, FaQuestionCircle, FaGithub } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Header({ currentStep, onReset }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Initialize dark mode state and add event listener
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check for system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // Check for stored preference
      const storedTheme = localStorage.getItem('theme');
      const initialDarkMode = storedTheme === 'dark' || (!storedTheme && prefersDark);
      
      setIsDarkMode(initialDarkMode);
      
      // Apply dark mode if needed
      if (initialDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // Listen for scroll events
      const handleScroll = () => {
        setScrolled(window.scrollY > 10);
      };
      
      window.addEventListener('scroll', handleScroll);
      
      // Listen for system preference changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        // Only change if no stored preference
        if (!localStorage.getItem('theme')) {
          setIsDarkMode(e.matches);
          if (e.matches) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      };
      
      // Add listener
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
      } else {
        // Fallback for older browsers
        mediaQuery.addListener(handleChange);
      }
      
      return () => {
        window.removeEventListener('scroll', handleScroll);
        
        // Clean up listener
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handleChange);
        } else {
          // Fallback for older browsers
          mediaQuery.removeListener(handleChange);
        }
      };
    }
  }, []);
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    if (typeof document !== 'undefined') {
      // Toggle the class
      document.documentElement.classList.toggle('dark');
      
      // Update state
      const newDarkMode = !isDarkMode;
      setIsDarkMode(newDarkMode);
      
      // Store user preference
      localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    }
  };

  // Check if we're in results mode
  const isResultsMode = currentStep === 'results';
  
  // Handle logo click based on current mode
  const handleLogoClick = (e) => {
    if (isResultsMode && onReset) {
      e.preventDefault();
      onReset();
    }
  };
  
  return (
    <header 
      className={`sticky top-0 z-50 w-full backdrop-blur-md transition-all duration-200 border-b border-card-border bg-white/80 dark:bg-gray-900/80 ${
        scrolled ? 'py-2 shadow-sm' : 'py-3'
      }`}
    >
      <div className="container-fluid flex items-center justify-between">
        {/* Logo/Brand - constrained to ~20% */}
        <div className="w-1/5 min-w-[160px] flex-shrink-0">
          {isResultsMode ? (
            <motion.div 
              onClick={handleLogoClick}
              className="flex items-center cursor-pointer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              title="Start over"
            >
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 mr-2.5 shadow-md">
                <FaChartLine className="text-white" size={18} />
              </div>
              <div className="max-w-[140px] truncate">
                <h1 className="text-base font-bold text-gray-900 dark:text-white truncate">Business Comparison</h1>
                <p className="text-[11px] text-primary-600 dark:text-primary-400 truncate font-medium">Click to start over</p>
              </div>
            </motion.div>
          ) : (
            <Link href="/">
              <motion.div 
                className="flex items-center cursor-pointer"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 mr-2.5 shadow-md">
                  <FaChartLine className="text-white" size={18} />
                </div>
                <div className="max-w-[140px] truncate">
                  <h1 className="text-base font-bold text-gray-900 dark:text-white truncate">Business Comparison</h1>
                  <p className="text-[11px] text-gray-700 dark:text-gray-300 truncate">AI-powered insights</p>
                </div>
              </motion.div>
            </Link>
          )}
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
            className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaGithub size={16} />
          </motion.a>
          
          <motion.a
            href="#help"
            className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaQuestionCircle size={16} />
          </motion.a>
          
          <motion.button
            onClick={toggleDarkMode}
            className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors relative"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Toggle dark mode"
          >
            <motion.div
              initial={{ opacity: 1, rotate: 0 }}
              animate={{ 
                opacity: isDarkMode ? 0 : 1,
                rotate: isDarkMode ? 90 : 0,
                scale: isDarkMode ? 0.5 : 1,
              }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <FaSun size={16} />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ 
                opacity: isDarkMode ? 1 : 0,
                rotate: isDarkMode ? 0 : -90,
                scale: isDarkMode ? 1 : 0.5,
              }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <FaMoon size={16} />
            </motion.div>
          </motion.button>
          
          <Link href="/">
            <motion.button
              className="ml-1 px-4 py-2 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 dark:from-primary-600 dark:to-secondary-600 text-white font-medium shadow-md hover:shadow-lg transition-shadow"
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
      className="px-3 py-2 rounded-lg text-sm text-gray-800 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors relative group font-medium"
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