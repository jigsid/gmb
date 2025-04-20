import { useState, useRef } from 'react';
import GmbUrlHelper from './GmbUrlHelper';
import { FaExclamationTriangle, FaBuilding, FaGlobe, FaStar, FaMapMarkerAlt, FaInfoCircle, FaSearch, FaChartBar, FaLightbulb, FaRobot, FaArrowRight } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function BusinessForm({ onSubmit, isLoading, error }) {
  const [formData, setFormData] = useState({
    profileUrl: ''
  });
  const [formError, setFormError] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <motion.form 
        onSubmit={handleSubmit} 
        className="space-y-4"
      >
        <div>
          <div className={`relative transition-all duration-300 ${isFocused ? 'scale-[1.02]' : 'scale-100'}`}>
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaSearch className={`${isFocused ? 'text-primary-500' : 'text-neutral-400'} transition-colors`} size={16} />
            </div>
            <input
              ref={inputRef}
              type="text"
              name="profileUrl"
              value={formData.profileUrl}
              onChange={handleChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Enter your Google Business URL"
              className={`w-full pl-12 pr-4 py-4 rounded-xl border text-[15px] ${
                formError 
                  ? 'border-red-400 bg-red-900/10' 
                  : isFocused 
                    ? 'border-primary-400 ring-2 ring-primary-900/30' 
                    : 'border-gray-700 bg-gray-800/50'
              } focus:outline-none backdrop-blur-sm transition-all duration-300 placeholder:text-gray-500`}
              disabled={isLoading}
              aria-invalid={!!formError}
              aria-describedby={formError ? "url-error" : undefined}
            />
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-red-400 text-sm flex items-center p-2 bg-red-900/10 rounded-lg"
              >
                <FaExclamationTriangle className="mr-2 text-red-400" size={14} />
                {error}
              </motion.div>
            )}
            
            {formError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-red-400 text-sm flex items-center p-2 bg-red-900/10 rounded-lg"
              >
                <FaExclamationTriangle className="mr-2 text-red-400" size={14} />
                {formError}
              </motion.div>
            )}
            
            {!error && !formError && (
              <div className="mt-2 text-gray-400 text-sm flex items-center">
                <FaInfoCircle className="mr-2 text-primary-400" size={14} />
                Enter the URL from Google Maps for your business
              </div>
            )}
          </div>
          
          <GmbUrlHelper />
        </div>
        
        <div className="space-y-3 text-sm">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-6 h-6 mr-2 rounded-full bg-primary-900/30">
              <FaChartBar className="text-primary-500" size={14} />
            </div>
            <span className="text-gray-300">Compare with competitors in your area</span>
          </div>
          
          <div className="flex items-center">
            <div className="flex items-center justify-center w-6 h-6 mr-2 rounded-full bg-secondary-900/30">
              <FaLightbulb className="text-secondary-400" size={14} />
            </div>
            <span className="text-gray-300">Get AI-powered growth recommendations</span>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full relative overflow-hidden rounded-xl py-4 text-base font-semibold border-2 ${
            isLoading 
              ? 'bg-gray-700 cursor-not-allowed text-gray-400 border-gray-600'
              : 'bg-gradient-to-r from-primary-600 to-secondary-600 hover:shadow-lg hover:shadow-primary-600/20 active:shadow-sm transition-all border-primary-500'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-white">Analyzing...</span>
            </div>
          ) : (
            <span className="relative z-10 text-white flex items-center justify-center">
              Analyze My Business <FaArrowRight className="ml-2" size={14} />
            </span>
          )}
        </button>
        
        <div className="flex items-center justify-center">
          <div className="h-px bg-gray-800 flex-grow mr-3"></div>
          <span className="text-xs text-gray-500">100% free, no credit card</span>
          <div className="h-px bg-gray-800 flex-grow ml-3"></div>
        </div>
      </motion.form>
    </motion.div>
  );
} 