import { useState, useEffect } from 'react';
import { LoadScript, Autocomplete } from '@react-google-maps/api';
import { FaMapMarkerAlt, FaSearch } from 'react-icons/fa';
import { motion } from 'framer-motion';

const libraries = ['places'];

export default function PlacesAutocomplete({ 
  onPlaceSelect, 
  placeholder = "Search for a location", 
  className = "",
  labelText,
  value,
  error,
  required = false
}) {
  const [autocomplete, setAutocomplete] = useState(null);
  const [inputValue, setInputValue] = useState(value || '');
  const [isFocused, setIsFocused] = useState(false);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    // Get the API key from environment variable
    // We retrieve it on the client-side to avoid exposing it in the HTML
    const fetchApiKey = async () => {
      try {
        const response = await fetch('/api/config/maps-api-key');
        const data = await response.json();
        setApiKey(data.apiKey);
      } catch (error) {
        console.error('Failed to fetch Google Maps API key:', error);
      }
    };

    fetchApiKey();
  }, []);

  useEffect(() => {
    if (value !== undefined && value !== inputValue) {
      setInputValue(value);
    }
  }, [value]);

  const onLoad = (autocompleteInstance) => {
    setAutocomplete(autocompleteInstance);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      
      if (place.formatted_address) {
        setInputValue(place.formatted_address);
      }
      
      onPlaceSelect && onPlaceSelect(place);
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // Don't render until we have the API key
  if (!apiKey) {
    return (
      <div className={`relative ${className}`}>
        {labelText && (
          <label className="block text-sm font-medium text-foreground-secondary mb-1">
            {labelText} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="h-10 bg-gray-800 animate-pulse rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {labelText && (
        <label className="block text-sm font-medium text-foreground-secondary mb-1">
          {labelText} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <LoadScript
        googleMapsApiKey={apiKey}
        libraries={libraries}
      >
        <div className={`relative transition-all duration-300 ${isFocused ? 'scale-[1.02]' : 'scale-100'}`}>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaMapMarkerAlt 
              className={`${isFocused ? 'text-primary-500' : 'text-neutral-400'} transition-colors`} 
              size={16} 
            />
          </div>
          
          <Autocomplete
            onLoad={onLoad}
            onPlaceChanged={onPlaceChanged}
          >
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border text-[15px] ${
                error 
                  ? 'border-red-400 bg-red-900/10' 
                  : isFocused 
                    ? 'border-primary-400 ring-2 ring-primary-900/30' 
                    : 'border-gray-700 bg-gray-800/50'
              } focus:outline-none backdrop-blur-sm transition-all duration-300 placeholder:text-gray-500`}
              required={required}
            />
          </Autocomplete>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-red-400 text-sm flex items-center p-2 bg-red-900/10 rounded-lg"
            >
              <FaSearch className="mr-2 text-red-400" size={14} />
              {error}
            </motion.div>
          )}
        </div>
      </LoadScript>
    </div>
  );
} 