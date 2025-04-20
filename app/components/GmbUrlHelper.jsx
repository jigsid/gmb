import { useState } from 'react';
import { FaInfoCircle, FaLink, FaSearch, FaCopy, FaChevronDown, FaChevronUp, FaMapMarkedAlt } from 'react-icons/fa';

export default function GmbUrlHelper() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-[10px] text-blue-600 hover:text-blue-800 flex items-center"
        type="button"
      >
        <FaInfoCircle className="mr-1" size={10} />
        {isOpen ? 'Hide instructions' : 'How to find your business on Google Maps'}
        {isOpen ? <FaChevronUp className="ml-1" size={8} /> : <FaChevronDown className="ml-1" size={8} />}
      </button>

      {isOpen && (
        <div className="mt-1 p-2 bg-blue-50 rounded-md text-[10px] text-gray-700">
          <h4 className="font-medium text-gray-800 mb-1">Finding your business on Google Maps:</h4>
          <ol className="space-y-1">
            <li className="flex items-start">
              <div className="flex-shrink-0 mr-1 mt-0.5 text-blue-600">
                <FaSearch size={8} />
              </div>
              <div>
                <p>Go to <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium hover:underline">Google Maps</a> and search for your business</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 mr-1 mt-0.5 text-blue-600">
                <FaCopy size={8} />
              </div>
              <div>
                <p>Copy the URL from your browser's address bar</p>
              </div>
            </li>
          </ol>
          
          <div className="mt-1 border-t border-blue-200 pt-1">
            <p className="font-medium text-[9px] text-gray-700">URL example:</p>
            <code className="block bg-white p-1 rounded text-[8px] overflow-x-auto border border-blue-200 text-gray-800">
              https://www.google.com/maps/place/Business+Name/@37.1234,-122.5678,15z/
            </code>
          </div>
        </div>
      )}
    </div>
  );
} 