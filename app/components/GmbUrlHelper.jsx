import { useState } from 'react';
import { FaInfoCircle, FaLink, FaSearch, FaCopy, FaChevronDown, FaChevronUp, FaMapMarkedAlt } from 'react-icons/fa';

export default function GmbUrlHelper() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm text-blue-500 hover:text-blue-600 flex items-center"
      >
        <FaInfoCircle className="mr-1" />
        {isOpen ? 'Hide Instructions' : 'How to find your business on Google Maps'}
        {isOpen ? <FaChevronUp className="ml-1" /> : <FaChevronDown className="ml-1" />}
      </button>

      {isOpen && (
        <div className="mt-2 p-4 bg-blue-50 rounded-md text-sm text-gray-600">
          <h4 className="font-medium text-gray-700 mb-2">Finding your business on Google Maps:</h4>
          <ol className="space-y-3">
            <li className="flex items-start">
              <div className="flex-shrink-0 mr-2 mt-1 text-blue-500">
                <FaSearch />
              </div>
              <div>
                <p>Go to <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Google Maps</a> and search for your business name + location (e.g., "Acme Business New York")</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 mr-2 mt-1 text-blue-500">
                <FaLink />
              </div>
              <div>
                <p>Click on your business listing in the search results</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 mr-2 mt-1 text-blue-500">
                <FaCopy />
              </div>
              <div>
                <p>Copy the entire URL from your browser's address bar</p>
              </div>
            </li>
          </ol>
          
          <div className="mt-4 border-t border-blue-100 pt-3">
            <h5 className="font-medium text-gray-700 mb-2 flex items-center">
              <FaMapMarkedAlt className="mr-2" />
              Acceptable URL formats:
            </h5>
            <div className="space-y-2">
              <div>
                <p className="font-medium text-xs text-gray-600">Business URL example:</p>
                <code className="block bg-white p-2 mt-1 rounded text-xs overflow-x-auto border border-blue-100">
                  https://www.google.com/maps/place/Business+Name/@37.1234,-122.5678,15z/
                </code>
              </div>
              <div>
                <p className="font-medium text-xs text-gray-600">Or with place details:</p>
                <code className="block bg-white p-2 mt-1 rounded text-xs overflow-x-auto border border-blue-100 text-xs">
                  https://www.google.com/maps/place/Business+Name/data=!4m5!3m4!...
                </code>
              </div>
            </div>
            <p className="mt-3 text-xs italic text-gray-500">
              Our system will automatically extract your business details using the Google Places API
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 