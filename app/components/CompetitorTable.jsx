import { useState } from 'react';
import { FaStar, FaExternalLinkAlt, FaTrophy, FaBuilding, FaChartBar, FaSortAmountDown, FaSortAmountUp, FaFilter, FaSearch, FaMapMarkerAlt, FaPhone, FaGlobeAmericas, FaTags, FaInfoCircle, FaComments, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { motion } from 'framer-motion';
import PlacesAutocomplete from './PlacesAutocomplete';
import React from 'react';

export default function CompetitorTable({ businessData, competitors, seoData }) {
  // Handle missing or invalid data
  if (!businessData) return null;
  
  // Ensure competitors is always an array
  const competitorsList = Array.isArray(competitors) ? competitors : [];
  
  // State for sorting
  const [sortField, setSortField] = useState('rating');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // State for filtering and advanced competitor search
  const [filterCategory, setFilterCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingCompetitors, setIsSearchingCompetitors] = useState(false);
  const [customCompetitors, setCustomCompetitors] = useState([]);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    minRating: 0,
    maxDistance: 50,
    services: [],
    priceRange: '',
    coordinates: null
  });
  const [expandedCompetitor, setExpandedCompetitor] = useState(null);
  
  // Function to handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  // Extract unique categories from competitors
  const categories = [...new Set(competitorsList.map(comp => comp.category).filter(Boolean))];
  
  // Function to filter competitors
  const filterCompetitors = () => {
    let filtered = [...competitorsList];
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(comp => 
        (comp.name && comp.name.toLowerCase().includes(query)) ||
        (comp.category && comp.category.toLowerCase().includes(query)) ||
        (comp.location && comp.location.toLowerCase().includes(query))
      );
    }
    
    // Filter by category
    if (filterCategory) {
      filtered = filtered.filter(comp => comp.category === filterCategory);
    }
    
    // Apply advanced filters
    if (advancedFilters.minRating > 0) {
      filtered = filtered.filter(comp => (comp.rating || 0) >= advancedFilters.minRating);
    }
    
    // Sort competitors
    return filtered.sort((a, b) => {
      // Handle missing values
      if (!a[sortField] && !b[sortField]) return 0;
      if (!a[sortField]) return 1;
      if (!b[sortField]) return -1;
      
      // Compare values
      const comparison = a[sortField] > b[sortField] ? 1 : -1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };
  
  // Get filtered and sorted competitors
  const filteredCompetitors = filterCompetitors();
  
  // Combine with custom competitors if any
  const allCompetitors = [...filteredCompetitors, ...customCompetitors];
  
  // All businesses including yours for comparison
  const allBusinesses = [
    { ...businessData, isYou: true },
    ...allCompetitors
  ];
  
  // Find the best rating
  const bestRating = Math.max(...allBusinesses.map(b => b.rating || 0));
  const mostReviews = Math.max(...allBusinesses.map(b => b.reviews || 0));

  // Function to search for new competitors
  const handleSearchCompetitors = async () => {
    if (!searchQuery) return;
    
    setIsSearchingCompetitors(true);
    
    try {
      // Call the competitor search API with the search query
      const response = await fetch('/api/custom-competitors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchQuery,
          businessCategory: businessData.category,
          businessLocation: businessData.location,
          filters: advancedFilters,
          coordinates: advancedFilters.coordinates
        }),
      });
      
      if (response.ok) {
        const newCompetitors = await response.json();
        console.log('Successfully fetched competitors:', newCompetitors.length);
        setCustomCompetitors(prevCompetitors => {
          // Merge avoiding duplicates by name
          const existingNames = prevCompetitors.map(c => c.name);
          const uniqueNew = newCompetitors.filter(c => !existingNames.includes(c.name));
          return [...prevCompetitors, ...uniqueNew];
        });
      } else {
        console.error('Failed to search competitors');
      }
    } catch (error) {
      console.error('Error searching competitors:', error);
    } finally {
      setIsSearchingCompetitors(false);
    }
  };
  
  // Handle place selection from PlacesAutocomplete
  const handlePlaceSelect = (place) => {
    if (place) {
      // Extract coordinates if available
      let coords = null;
      if (place.geometry && place.geometry.location) {
        coords = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
      }
      
      // Set search query from the selected place
      if (place.formatted_address) {
        setSearchQuery(place.formatted_address);
      } else if (place.name) {
        setSearchQuery(place.name);
      }
      
      // Save coordinates for API calls
      setAdvancedFilters(prev => ({
        ...prev,
        coordinates: coords
      }));
      
      // Automatically search for competitors after a place is selected
      setTimeout(() => {
        handleSearchCompetitors();
      }, 100);
    }
  };
  
  // Function to get competitor strengths and weaknesses
  const getCompetitorAnalysis = (competitor) => {
    const strengths = [];
    const weaknesses = [];
    
    // Compare against your business
    if (competitor.rating > (businessData.rating || 0)) {
      strengths.push(`Higher rating than your business (${competitor.rating} vs ${businessData.rating || 0})`);
    } else if (competitor.rating < (businessData.rating || 0)) {
      weaknesses.push(`Lower rating than your business (${competitor.rating} vs ${businessData.rating || 0})`);
    }
    
    if (competitor.reviews > (businessData.reviews || 0)) {
      strengths.push(`More reviews than your business (${competitor.reviews} vs ${businessData.reviews || 0})`);
    } else if (competitor.reviews < (businessData.reviews || 0)) {
      weaknesses.push(`Fewer reviews than your business (${competitor.reviews} vs ${businessData.reviews || 0})`);
    }
    
    // Add generic strengths based on high metrics
    if (competitor.rating >= 4.5) {
      strengths.push('Excellent customer satisfaction');
    }
    
    if (competitor.reviews >= 100) {
      strengths.push('Strong online presence with many reviews');
    }
    
    // Add generic weaknesses based on low metrics
    if (competitor.rating < 4.0) {
      weaknesses.push('Room for improvement in customer satisfaction');
    }
    
    if (competitor.reviews < 50) {
      weaknesses.push('Limited online review presence');
    }
    
    return { strengths, weaknesses };
  };
  
  // Toggle expanded competitor view
  const toggleCompetitorExpanded = (index) => {
    if (expandedCompetitor === index) {
      setExpandedCompetitor(null);
    } else {
      setExpandedCompetitor(index);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full glass-card p-6 rounded-2xl border border-card-border shadow-float backdrop-blur-sm overflow-hidden"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary-900/30 mr-3">
            <FaChartBar className="text-secondary-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Competitor Comparison</h2>
            <p className="text-sm text-foreground-tertiary">{allCompetitors.length} competitors analyzed</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSort('rating')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center ${
              sortField === 'rating' 
                ? 'bg-secondary-900/30 text-secondary-400' 
                : 'bg-neutral-800 text-foreground-tertiary'
            }`}
          >
            <FaStar className="mr-1.5" size={10} />
            Rating
            {sortField === 'rating' && (
              sortDirection === 'desc' ? <FaSortAmountDown className="ml-1.5" size={10} /> : <FaSortAmountUp className="ml-1.5" size={10} />
            )}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSort('reviews')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center ${
              sortField === 'reviews' 
                ? 'bg-secondary-900/30 text-secondary-400' 
                : 'bg-neutral-800 text-foreground-tertiary'
            }`}
          >
            <FaFilter className="mr-1.5" size={10} />
            Reviews
            {sortField === 'reviews' && (
              sortDirection === 'desc' ? <FaSortAmountDown className="ml-1.5" size={10} /> : <FaSortAmountUp className="ml-1.5" size={10} />
            )}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
            className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center bg-primary-900/30 text-primary-400"
          >
            <FaSearch className="mr-1.5" size={10} />
            Find Perfect Competitors
          </motion.button>
        </div>
      </div>
      
      {/* Advanced Search Panel */}
      {showAdvancedSearch && (
        <div className="mb-6 p-4 bg-background-secondary/50 rounded-xl border border-neutral-800">
          <h3 className="text-md font-medium text-foreground mb-3">Find Perfect Competitors</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs text-foreground-tertiary mb-1">Search by location</label>
              <PlacesAutocomplete
                placeholder="Enter location or business name"
                onPlaceSelect={handlePlaceSelect}
                value={searchQuery}
              />
            </div>
            
            <div>
              <label className="block text-xs text-foreground-tertiary mb-1">Filter by category</label>
              <select
                className="w-full px-3 py-2 bg-background-secondary border border-neutral-700 rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary-500"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((category, idx) => (
                  <option key={idx} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs text-foreground-tertiary mb-1">Minimum Rating</label>
              <select
                className="w-full px-3 py-2 bg-background-secondary border border-neutral-700 rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary-500"
                value={advancedFilters.minRating}
                onChange={(e) => setAdvancedFilters({...advancedFilters, minRating: parseFloat(e.target.value)})}
              >
                <option value="0">Any Rating</option>
                <option value="3">3+ Stars</option>
                <option value="3.5">3.5+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end">
            {isSearchingCompetitors ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="px-4 py-2 bg-primary-900/50 text-primary-400 rounded-lg text-sm flex items-center"
              >
                <FaSearch className="mr-2 animate-spin" />
                <span>Searching for competitors...</span>
              </motion.div>
            ) : (
              <button
                onClick={handleSearchCompetitors}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm flex items-center"
              >
                <FaSearch className="mr-2" />
                Find Competitors
              </button>
            )}
          </div>
        </div>
      )}
      
      {allCompetitors.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-10 px-4 bg-background-secondary/50 rounded-xl border border-neutral-800"
        >
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-800">
            <FaBuilding className="text-neutral-400" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No competitors found</h3>
          <p className="text-foreground-tertiary max-w-md mx-auto">
            Try specifying a more precise location or checking your business category to find relevant competitors.
          </p>
        </motion.div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-800">
          <table className="min-w-full divide-y divide-neutral-800">
            <thead className="bg-background-secondary">
              <tr>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-foreground-tertiary uppercase tracking-wider">
                  Business
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-foreground-tertiary uppercase tracking-wider">
                  Rating
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-foreground-tertiary uppercase tracking-wider">
                  Reviews
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-foreground-tertiary uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-background-secondary/30 backdrop-blur-sm divide-y divide-neutral-800">
              {/* Businesses (yours and competitors) */}
              {allBusinesses.map((business, index) => {
                // Calculate metrics
                const ratingPercentage = business.rating ? (business.rating / 5) * 100 : 0;
                const reviewsPercentage = business.reviews && mostReviews ? (business.reviews / mostReviews) * 100 : 0;
                const isTopRated = business.rating && business.rating >= bestRating;
                
                // Get competitor analysis if not your business
                const analysis = !business.isYou ? getCompetitorAnalysis(business) : null;
                const isExpanded = expandedCompetitor === index;
                
                // Add data source indicator
                const dataSource = business.searchResultType || (business.isEstimated ? 'mock' : '');
                const isPlacesApi = dataSource.includes('places');
                
                return (
                  <React.Fragment key={`business-${index}`}>
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + (index * 0.05) }}
                      className={`
                        ${business.isYou ? 'bg-primary-900/20' : isPlacesApi ? 'bg-secondary-900/10' : 'hover:bg-neutral-800/50'}
                        transition-colors cursor-pointer
                      `}
                      onClick={() => !business.isYou && toggleCompetitorExpanded(index)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full mr-3 ${
                            business.isYou 
                              ? 'bg-primary-900/50 text-primary-500' 
                              : isTopRated 
                                ? 'bg-amber-900/50 text-amber-500'
                                : isPlacesApi
                                  ? 'bg-secondary-900/50 text-secondary-500'
                                  : 'bg-neutral-800 text-neutral-500'
                          }`}>
                            {business.isYou ? (
                              <FaBuilding size={16} />
                            ) : isTopRated ? (
                              <FaTrophy size={16} />
                            ) : (
                              <FaBuilding size={16} />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-foreground flex items-center">
                              {business.name || 'Unknown'} 
                              {business.isYou && <span className="ml-2 text-xs py-0.5 px-2 rounded-full bg-primary-900/50 text-primary-500">You</span>}
                              {isTopRated && !business.isYou && (
                                <span className="ml-2 text-xs py-0.5 px-2 rounded-full bg-amber-900/50 text-amber-500">Top Rated</span>
                              )}
                              {isPlacesApi && !business.isYou && (
                                <span className="ml-2 text-xs py-0.5 px-2 rounded-full bg-secondary-900/50 text-secondary-500">Google Places</span>
                              )}
                            </div>
                            <div className="text-xs text-foreground-tertiary mt-1 flex items-center">
                              <FaMapMarkerAlt className="mr-1" size={10} />
                              {business.address || business.location || 'Location not available'}
                            </div>
                            {business.distance && (
                              <div className="text-xs text-foreground-tertiary mt-1 flex items-center">
                                <span className="inline-block w-3 h-px bg-neutral-600 mr-1"></span>
                                Distance: {business.distance}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="flex items-center mb-1">
                            <div className="text-sm font-medium text-foreground mr-2">{business.rating || 'N/A'}</div>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <FaStar 
                                  key={star}
                                  className={`${
                                    business.rating && star <= Math.floor(business.rating) 
                                      ? 'text-amber-400' 
                                      : business.rating && star <= business.rating 
                                        ? 'text-amber-300' // Half star
                                        : 'text-neutral-700'
                                  } w-3 h-3`} 
                                />
                              ))}
                            </div>
                            {business.isEstimated && <span className="ml-1 text-xs text-foreground-tertiary">*</span>}
                          </div>
                          <div className="w-full bg-neutral-700 rounded-full h-1.5 overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${ratingPercentage}%` }}
                              transition={{ duration: 1, delay: 0.2 + (index * 0.05) }}
                              className={`h-full rounded-full ${business.isYou ? 'bg-primary-500' : 'bg-secondary-500'}`}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-foreground mb-1">
                            {typeof business.reviews === 'number' ? business.reviews.toLocaleString() : 'N/A'}
                            {business.isEstimated && <span className="ml-1 text-xs text-foreground-tertiary">*</span>}
                          </div>
                          <div className="w-full bg-neutral-700 rounded-full h-1.5 overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${reviewsPercentage}%` }}
                              transition={{ duration: 1, delay: 0.3 + (index * 0.05) }}
                              className={`h-full rounded-full ${business.isYou ? 'bg-primary-500' : 'bg-secondary-500'}`}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {business.website ? (
                          <motion.a 
                            href={business.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="py-1.5 px-3 rounded-full text-xs flex items-center bg-neutral-800 hover:bg-primary-900/30 text-foreground-secondary hover:text-primary-500 transition-colors inline-flex"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FaExternalLinkAlt className="mr-1.5" size={10} />
                            {/* Safely extract domain from website URL */}
                            {(business.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]) || 'website'}
                          </motion.a>
                        ) : (
                          <span className="text-foreground-tertiary text-xs">Not available</span>
                        )}
                        
                        {!business.isYou && (
                          <div className="mt-2">
                            <button 
                              className="flex items-center text-xs text-primary-400 hover:text-primary-300"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCompetitorExpanded(index);
                              }}
                            >
                              {isExpanded ? (
                                <>View Less <FaArrowUp className="ml-1" size={10} /></>
                              ) : (
                                <>View More <FaArrowDown className="ml-1" size={10} /></>
                              )}
                            </button>
                          </div>
                        )}
                      </td>
                    </motion.tr>
                    
                    {/* Expanded competitor details */}
                    {!business.isYou && isExpanded && (
                      <motion.tr
                        key={`detail-${index}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-neutral-800/30"
                      >
                        <td colSpan="4" className="px-6 py-4">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Left column */}
                            <div>
                              <h4 className="text-sm font-medium text-foreground-secondary mb-2 flex items-center">
                                <FaInfoCircle className="mr-2" size={14} />
                                Business Details
                              </h4>
                              
                              <div className="space-y-3 text-sm">
                                {/* Category */}
                                {business.category && (
                                  <div className="flex items-start">
                                    <FaTags className="text-neutral-400 mt-1 mr-2" size={12} />
                                    <div>
                                      <span className="text-foreground-tertiary">Category:</span>
                                      <span className="ml-2 text-foreground">{business.category}</span>
                                    </div>
                                  </div>
                                )}
                                
                                {/* Phone */}
                                {business.phone && (
                                  <div className="flex items-start">
                                    <FaPhone className="text-neutral-400 mt-1 mr-2" size={12} />
                                    <div>
                                      <span className="text-foreground-tertiary">Phone:</span>
                                      <span className="ml-2 text-foreground">{business.phone}</span>
                                    </div>
                                  </div>
                                )}
                                
                                {/* Address */}
                                {business.address && (
                                  <div className="flex items-start">
                                    <FaMapMarkerAlt className="text-neutral-400 mt-1 mr-2" size={12} />
                                    <div>
                                      <span className="text-foreground-tertiary">Address:</span>
                                      <span className="ml-2 text-foreground">{business.address}</span>
                                    </div>
                                  </div>
                                )}
                                
                                {/* Website */}
                                {business.website && (
                                  <div className="flex items-start">
                                    <FaGlobeAmericas className="text-neutral-400 mt-1 mr-2" size={12} />
                                    <div>
                                      <span className="text-foreground-tertiary">Website:</span>
                                      <a 
                                        href={business.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-2 text-primary-400 hover:text-primary-300 hover:underline"
                                      >
                                        {business.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
                                      </a>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Right column */}
                            <div>
                              <h4 className="text-sm font-medium text-foreground-secondary mb-2 flex items-center">
                                <FaComments className="mr-2" size={14} />
                                Competitive Analysis
                              </h4>
                              
                              {/* Strengths */}
                              {analysis.strengths.length > 0 && (
                                <div className="mb-3">
                                  <h5 className="text-xs font-medium text-green-400 mb-1">Strengths</h5>
                                  <ul className="space-y-1">
                                    {analysis.strengths.map((strength, idx) => (
                                      <li key={idx} className="text-xs text-green-300 flex items-start">
                                        <FaArrowUp className="text-green-500 mt-1 mr-2" size={10} />
                                        {strength}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {/* Weaknesses */}
                              {analysis.weaknesses.length > 0 && (
                                <div>
                                  <h5 className="text-xs font-medium text-red-400 mb-1">Weaknesses</h5>
                                  <ul className="space-y-1">
                                    {analysis.weaknesses.map((weakness, idx) => (
                                      <li key={idx} className="text-xs text-red-300 flex items-start">
                                        <FaArrowDown className="text-red-500 mt-1 mr-2" size={10} />
                                        {weakness}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-400 flex items-center">
        <FaInfoCircle className="mr-2" size={10} />
        Competitors are displayed from Google Places API, SerpAPI, or generated based on your business profile.
      </div>
    </motion.div>
  );
} 