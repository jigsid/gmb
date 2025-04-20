import { useState } from 'react';
import GmbUrlHelper from './GmbUrlHelper';
import { FaExclamationTriangle, FaBuilding, FaGlobe, FaStar, FaMapMarkerAlt } from 'react-icons/fa';

export default function BusinessForm({ onSubmit, isLoading, error }) {
  const [formData, setFormData] = useState({
    profileUrl: ''
  });
  const [formError, setFormError] = useState('');

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
    <div className="w-full max-w-md mx-auto bg-white p-8 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Compare Your Business</h2>
      
      <div className="mb-6 bg-blue-50 p-4 rounded-lg">
        <h3 className="text-md font-medium text-gray-700 mb-2">We'll extract the following data:</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center">
            <FaBuilding className="mr-2 text-blue-500" />
            Business name and category
          </li>
          <li className="flex items-center">
            <FaGlobe className="mr-2 text-blue-500" />
            Website URL 
          </li>
          <li className="flex items-center">
            <FaStar className="mr-2 text-blue-500" />
            Ratings and number of reviews
          </li>
          <li className="flex items-center">
            <FaMapMarkerAlt className="mr-2 text-blue-500" />
            Business location and area
          </li>
        </ul>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="profileUrl" className="block text-sm font-medium text-gray-700 mb-1">
            Google My Business Profile URL
          </label>
          <input
            type="url"
            id="profileUrl"
            name="profileUrl"
            value={formData.profileUrl}
            onChange={handleChange}
            placeholder="e.g. https://www.google.com/maps/place/your-business"
            className={`w-full px-4 py-2 rounded-md border ${formError ? 'border-red-400' : 'border-blue-200'} focus:outline-none focus:ring-2 ${formError ? 'focus:ring-red-400' : 'focus:ring-blue-400'} focus:border-transparent bg-white`}
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Find your business on Google Maps and paste the URL here
          </p>
          
          {formError && (
            <div className="mt-2 text-red-500 text-sm flex items-center">
              <FaExclamationTriangle className="mr-1" />
              {formError}
            </div>
          )}
          
          {error && (
            <div className="mt-2 text-red-500 text-sm flex items-center">
              <FaExclamationTriangle className="mr-1" />
              {error}
            </div>
          )}
          
          <GmbUrlHelper />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded-md font-medium text-white transition-colors ${
            isLoading 
              ? 'bg-blue-300 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </div>
          ) : (
            'Extract Business Data'
          )}
        </button>
      </form>
      
      <div className="mt-4 text-sm text-gray-500">
        <p className="italic text-center">All data will be automatically extracted from your Google Maps URL</p>
      </div>
    </div>
  );
} 