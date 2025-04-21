import { useState } from 'react';
import { FaInfoCircle, FaLink, FaSearch, FaCopy, FaChevronDown, FaChevronUp, FaMapMarkedAlt, FaExternalLinkAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function GmbUrlHelper() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs text-primary-400 hover:text-primary-300 flex items-center transition-colors px-2 py-0.5 rounded-lg hover:bg-primary-900/20"
        type="button"
      >
        <FaInfoCircle className="mr-1" size={10} />
        {isOpen ? 'Hide instructions' : 'How to find your business on Google Maps'}
        {isOpen ? <FaChevronUp className="ml-1" size={9} /> : <FaChevronDown className="ml-1" size={9} />}
      </button>

      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-3 p-4 glass-card backdrop-blur-sm border border-gray-700 rounded-xl text-xs text-gray-300"
        >
          <h4 className="font-medium text-white mb-3 flex items-center">
            <div className="flex items-center justify-center w-6 h-6 mr-2 rounded-full bg-gradient-to-br from-primary-600 to-primary-800">
              <FaMapMarkedAlt className="text-white" size={12} />
            </div>
            Finding your business on Google Maps:
          </h4>
          <ol className="space-y-4 ml-2">
            <li className="flex items-start group">
              <div className="flex-shrink-0 mr-3 mt-0.5 h-6 w-6 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 group-hover:from-primary-700 group-hover:to-primary-900 flex items-center justify-center transition-all duration-300">
                <span className="text-gray-200 group-hover:text-white text-xs font-medium transition-colors">1</span>
              </div>
              <div className="pt-0.5">
                <p>Go to <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300 font-medium hover:underline transition-colors inline-flex items-center">
                  Google Maps
                  <FaExternalLinkAlt className="ml-1" size={8} />
                </a> and search for your business name</p>
              </div>
            </li>
            <li className="flex items-start group">
              <div className="flex-shrink-0 mr-3 mt-0.5 h-6 w-6 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 group-hover:from-secondary-700 group-hover:to-secondary-900 flex items-center justify-center transition-all duration-300">
                <span className="text-gray-200 group-hover:text-white text-xs font-medium transition-colors">2</span>
              </div>
              <div className="pt-0.5">
                <p>Select your business from the search results</p>
              </div>
            </li>
            <li className="flex items-start group">
              <div className="flex-shrink-0 mr-3 mt-0.5 h-6 w-6 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 group-hover:from-accent-700 group-hover:to-accent-900 flex items-center justify-center transition-all duration-300">
                <span className="text-gray-200 group-hover:text-white text-xs font-medium transition-colors">3</span>
              </div>
              <div className="pt-0.5">
                <p>Copy the URL from your browser's address bar</p>
              </div>
            </li>
          </ol>
          
          <div className="mt-5 border-t border-gray-700/50 pt-4">
            <p className="font-medium text-xs text-gray-400 mb-2 flex items-center">
              <FaLink className="mr-1.5" size={10} />
              URL example:
            </p>
            <div className="relative group">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary-500/20 via-secondary-500/20 to-accent-500/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <code className="block relative z-10 bg-gray-900/70 p-3 rounded-lg text-xs overflow-x-auto border border-gray-700 text-gray-300 font-mono">
                https://www.google.com/maps/place/Business+Name/@37.1234,-122.5678,15z/
              </code>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
} 