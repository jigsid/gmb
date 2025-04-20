import { useState } from 'react';
import { FaInfoCircle, FaLink, FaSearch, FaCopy, FaChevronDown, FaChevronUp, FaMapMarkedAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function GmbUrlHelper() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs text-primary-400 hover:text-primary-300 flex items-center transition-colors"
        type="button"
      >
        <FaInfoCircle className="mr-1.5" size={12} />
        {isOpen ? 'Hide instructions' : 'How to find your business on Google Maps'}
        {isOpen ? <FaChevronUp className="ml-1.5" size={10} /> : <FaChevronDown className="ml-1.5" size={10} />}
      </button>

      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-3 p-4 bg-gray-800/50 border border-gray-700 rounded-xl text-xs text-gray-300"
        >
          <h4 className="font-medium text-white mb-3 flex items-center">
            <FaMapMarkedAlt className="mr-2 text-primary-400" size={14} />
            Finding your business on Google Maps:
          </h4>
          <ol className="space-y-3 ml-2">
            <li className="flex items-start">
              <div className="flex-shrink-0 mr-2 mt-0.5 h-5 w-5 rounded-full bg-primary-900/40 flex items-center justify-center">
                <span className="text-primary-400 text-xs font-medium">1</span>
              </div>
              <div>
                <p>Go to <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300 font-medium hover:underline transition-colors">Google Maps</a> and search for your business name</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 mr-2 mt-0.5 h-5 w-5 rounded-full bg-primary-900/40 flex items-center justify-center">
                <span className="text-primary-400 text-xs font-medium">2</span>
              </div>
              <div>
                <p>Select your business from the search results</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 mr-2 mt-0.5 h-5 w-5 rounded-full bg-primary-900/40 flex items-center justify-center">
                <span className="text-primary-400 text-xs font-medium">3</span>
              </div>
              <div>
                <p>Copy the URL from your browser's address bar</p>
              </div>
            </li>
          </ol>
          
          <div className="mt-4 border-t border-gray-700 pt-4">
            <p className="font-medium text-xs text-gray-400 mb-2">URL example:</p>
            <code className="block bg-gray-900/70 p-3 rounded-lg text-xs overflow-x-auto border border-gray-700 text-gray-300 font-mono">
              https://www.google.com/maps/place/Business+Name/@37.1234,-122.5678,15z/
            </code>
          </div>
        </motion.div>
      )}
    </div>
  );
} 