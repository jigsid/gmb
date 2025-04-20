import { useState } from 'react';
import GmbUrlHelper from './GmbUrlHelper';
import { FaExclamationTriangle, FaBuilding, FaGlobe, FaStar, FaMapMarkerAlt, FaInfoCircle, FaSearch } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function BusinessForm({ onSubmit, isLoading, error }) {
  const [formData, setFormData] = useState({
    profileUrl: ''
  });
  const [formError, setFormError] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user changes input
    setFormError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic URL validation
    if (!formData.profileUrl.includes('google.com/maps')) {
      setFormError('Please enter a valid Google Maps URL');
      return;
    }
    
    setFormError('');
    onSubmit(formData);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto glass-card rounded-2xl p-4 border border-card-border shadow-float"
    >
      <motion.h2 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-lg font-bold mb-1 text-center bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text "
      >
        Compare Your Business
      </motion.h2>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center text-foreground-tertiary mb-3 text-xs"
      >
        AI-powered competitor analysis & growth insights in seconds
      </motion.p>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-4 bg-background-secondary/50 backdrop-blur-sm p-4 rounded-xl border border-primary-100 dark:border-primary-900"
      >
        <h3 className="text-xs font-medium text-foreground-secondary mb-2 flex items-center">
          <FaInfoCircle className="mr-2 text-primary-500" /> 
          We'll analyze the following data points:
        </h3>
        <div className="grid grid-cols-2 gap-2 text-xs text-foreground-tertiary">
          <motion.div 
            className="flex items-center"
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-center w-5 h-5 mr-1 rounded-full bg-primary-50 dark:bg-primary-900/30">
              <FaBuilding className="text-primary-500 text-xs" />
            </div>
            Business name & category
          </motion.div>
          <motion.div 
            className="flex items-center"
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center justify-center w-5 h-5 mr-1 rounded-full bg-secondary-50 dark:bg-secondary-900/30">
              <FaGlobe className="text-secondary-500 text-xs" />
            </div>
            Website & online presence
          </motion.div>
          <motion.div 
            className="flex items-center"
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex items-center justify-center w-5 h-5 mr-1 rounded-full bg-accent-50 dark:bg-accent-900/30">
              <FaStar className="text-accent-500 text-xs" />
            </div>
            Ratings & reviews
          </motion.div>
          <motion.div 
            className="flex items-center"
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-center justify-center w-5 h-5 mr-1 rounded-full bg-neutral-100 dark:bg-neutral-800">
              <FaMapMarkerAlt className="text-neutral-500 text-xs" />
            </div>
            Business location
          </motion.div>
        </div>
      </motion.div>
      
      <motion.form 
        onSubmit={handleSubmit} 
        className="space-y-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <div>
          <label htmlFor="profileUrl" className="block text-xs font-medium text-foreground-secondary mb-1">
            Google My Business Profile URL
          </label>
          <div className={`relative transition-all duration-300 ${isFocused ? 'scale-[1.02]' : 'scale-100'}`}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className={`${isFocused ? 'text-primary-500' : 'text-neutral-400'} transition-colors text-sm`} />
            </div>
            <input
              type="url"
              id="profileUrl"
              name="profileUrl"
              value={formData.profileUrl}
              onChange={handleChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="e.g. https://www.google.com/maps/place/your-business"
              className={`w-full pl-10 pr-4 py-2 rounded-xl border text-sm ${formError ? 'border-red-400 bg-red-50/30 dark:bg-red-900/10' : isFocused ? 'border-primary-400 ring-2 ring-primary-200/50 dark:ring-primary-900/30' : 'border-neutral-200 dark:border-neutral-700 bg-white/50 dark:bg-neutral-800/50'} focus:outline-none backdrop-blur-sm transition-all duration-300 placeholder:text-neutral-400`}
              required
            />
            {isFocused && (
              <motion.span 
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </div>
          <p className="mt-1 text-xs text-gray-700 dark:text-foreground-tertiary flex items-center">
            <FaInfoCircle className="mr-1 text-primary-600 dark:text-primary-400" />
            Find your business on Google Maps and copy the URL here
          </p>
          
          {formError && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 text-red-600 text-xs flex items-center p-1.5 bg-red-50 dark:bg-red-900/10 rounded-lg"
            >
              <FaExclamationTriangle className="mr-1.5 text-red-600" size={12} />
              {formError}
            </motion.div>
          )}
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 text-red-600 text-xs flex items-center p-1.5 bg-red-50 dark:bg-red-900/10 rounded-lg"
            >
              <FaExclamationTriangle className="mr-1.5 text-red-600" size={12} />
              {error}
            </motion.div>
          )}
          
          <GmbUrlHelper />
        </div>
        
        <motion.button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded-xl font-medium text-sm transition-all
            ${isLoading 
              ? 'bg-neutral-300 dark:bg-neutral-700 cursor-not-allowed text-neutral-600 dark:text-neutral-300' 
              : 'bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-500 dark:to-secondary-500 hover:from-primary-100 hover:to-secondary-100 dark:hover:from-primary-600 dark:hover:to-secondary-600 shadow-md hover:shadow-primary-500/20 active:shadow-sm'
            } relative overflow-hidden group`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {!isLoading && (
            <motion.span 
              className="absolute inset-0 bg-gradient-to-r from-primary-100 to-secondary-100 dark:from-primary-600 dark:to-secondary-600 opacity-0 group-hover:opacity-100 transition-opacity"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0 }}
            />
          )}
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-neutral-600 dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-neutral-700 dark:text-white">Processing...</span>
            </div>
          ) : (
            <span className="relative z-10 text-gray-900 dark:text-white font-semibold">Analyze My Business</span>
          )}
        </motion.button>
      </motion.form>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-3 text-xs text-gray-700 dark:text-foreground-tertiary"
      >
        <p className="text-center flex justify-center items-center text-[10px]">
          <FaInfoCircle className="mr-1 text-primary-600 dark:text-primary-400" size={10} />
          Powered by advanced AI for accurate growth insights
        </p>
      </motion.div>
    </motion.div>
  );
} 