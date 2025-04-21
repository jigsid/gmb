import { useState } from 'react';
import { FaStar, FaExternalLinkAlt, FaTrophy, FaBuilding, FaChartBar, FaSortAmountDown, FaSortAmountUp, FaFilter, FaSearch, FaMapMarkerAlt, FaPhone, FaGlobeAmericas, FaTags, FaInfoCircle, FaComments, FaArrowUp, FaArrowDown, FaChevronUp, FaChevronDown, FaPlus, FaStore, FaThumbsUp, FaThumbsDown, FaMinus } from 'react-icons/fa';
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
      className="w-full glass-card p-6 rounded-xl border border-card-border shadow-float backdrop-blur-sm overflow-hidden"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-secondary-500 to-info-600 mr-3 shadow-lg">
            <FaChartBar className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Competitor Analysis Dashboard</h2>
            <p className="text-sm text-foreground-tertiary">
              {allCompetitors.length} competitors analyzed in {businessData.category || 'your industry'}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleSort('rating')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center transition-all ${
              sortField === 'rating' 
                ? 'bg-secondary-500/20 text-secondary-500 border border-secondary-500/30' 
                : 'bg-neutral-800 text-foreground-tertiary hover:bg-neutral-700'
            }`}
          >
            <FaStar className="mr-1.5" size={10} />
            Rating
            {sortField === 'rating' && (
              sortDirection === 'desc' ? <FaSortAmountDown className="ml-1.5" size={10} /> : <FaSortAmountUp className="ml-1.5" size={10} />
            )}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleSort('reviews')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center transition-all ${
              sortField === 'reviews' 
                ? 'bg-secondary-500/20 text-secondary-500 border border-secondary-500/30' 
                : 'bg-neutral-800 text-foreground-tertiary hover:bg-neutral-700'
            }`}
          >
            <FaFilter className="mr-1.5" size={10} />
            Reviews
            {sortField === 'reviews' && (
              sortDirection === 'desc' ? <FaSortAmountDown className="ml-1.5" size={10} /> : <FaSortAmountUp className="ml-1.5" size={10} />
            )}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md"
          >
            <FaSearch className="mr-1.5" size={10} />
            Find Perfect Competitors
          </motion.button>
        </div>
      </div>
      
      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="glass-panel p-4 rounded-xl border border-neutral-800">
          <div className="flex justify-between mb-1">
            <div className="text-xs text-foreground-tertiary">Your Rating</div>
            <div className="flex items-center text-xs">
              <FaStar className="text-amber-400 mr-1" size={10} />
              <span className="font-medium">{businessData.rating.toFixed(1)}</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">{businessData.rating >= bestRating ? 'Top Rated' : 'Average'}</div>
          <div className="text-xs text-foreground-tertiary">
            {businessData.rating >= bestRating 
              ? 'Your business leads the market' 
              : `${(bestRating - businessData.rating).toFixed(1)} points below the top competitor`}
          </div>
        </div>
        
        <div className="glass-panel p-4 rounded-xl border border-neutral-800">
          <div className="flex justify-between mb-1">
            <div className="text-xs text-foreground-tertiary">Your Reviews</div>
            <div className="flex items-center text-xs">
              <FaComments className="text-primary-400 mr-1" size={10} />
              <span className="font-medium">{businessData.reviews}</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">
            {businessData.reviews >= mostReviews ? 'Market Leader' : 'Growing'}
          </div>
          <div className="text-xs text-foreground-tertiary">
            {businessData.reviews >= mostReviews 
              ? 'Highest number of reviews' 
              : `${mostReviews - businessData.reviews} reviews behind the leader`}
          </div>
        </div>
        
        <div className="glass-panel p-4 rounded-xl border border-neutral-800">
          <div className="flex justify-between mb-1">
            <div className="text-xs text-foreground-tertiary">Competitors</div>
            <div className="flex items-center text-xs">
              <FaBuilding className="text-secondary-400 mr-1" size={10} />
              <span className="font-medium">{competitorsList.length}</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">
            {competitorsList.length > 10 ? 'Competitive' : 'Emerging Market'}
          </div>
          <div className="text-xs text-foreground-tertiary">
            {competitorsList.length > 10 
              ? 'High competition in your area' 
              : 'Opportunity for market expansion'}
          </div>
        </div>
        
        <div className="glass-panel p-4 rounded-xl border border-neutral-800">
          <div className="flex justify-between mb-1">
            <div className="text-xs text-foreground-tertiary">Market Position</div>
            <div className="flex items-center text-xs">
              <FaTrophy className="text-warning-400 mr-1" size={10} />
              <span className="font-medium">
                {businessData.rating >= bestRating && businessData.reviews >= mostReviews 
                  ? '1st' 
                  : businessData.rating >= bestRating || businessData.reviews >= mostReviews 
                    ? 'Top 3' 
                    : 'Top 10'}
              </span>
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">
            {businessData.rating >= 4.5 ? 'Strong' : businessData.rating >= 4.0 ? 'Good' : 'Improving'}
          </div>
          <div className="text-xs text-foreground-tertiary">
            Based on {competitorsList.length} businesses analyzed
          </div>
        </div>
      </div>
      
      {/* Advanced Search Panel */}
      {showAdvancedSearch && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6 glass-panel p-4 rounded-xl border border-neutral-800"
        >
          <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground-secondary mb-1">Search Competitors</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-foreground-tertiary" size={12} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, category, or location..."
                  className="block w-full pl-10 pr-3 py-2 bg-background-tertiary border border-neutral-700 rounded-lg text-sm text-foreground-secondary focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground-secondary mb-1">Filter by Category</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaTags className="text-foreground-tertiary" size={12} />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 bg-background-tertiary border border-neutral-700 rounded-lg text-sm text-foreground-secondary focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground-secondary mb-1">Minimum Rating</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaStar className="text-amber-500" size={12} />
                </div>
                <select
                  value={advancedFilters.minRating}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, minRating: parseFloat(e.target.value)})}
                  className="block w-full pl-10 pr-3 py-2 bg-background-tertiary border border-neutral-700 rounded-lg text-sm text-foreground-secondary focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="0">Any Rating</option>
                  <option value="3">3+ Stars</option>
                  <option value="3.5">3.5+ Stars</option>
                  <option value="4">4+ Stars</option>
                  <option value="4.5">4.5+ Stars</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Table Section */}
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
                  <React.Fragment key={index}>
                    <tr className={`${business.isYou ? 'bg-primary-900/10 hover:bg-primary-900/15' : ''} ${isTopRated && !business.isYou ? 'bg-secondary-900/10 hover:bg-secondary-900/15' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full ${
                            business.isYou 
                              ? 'bg-gradient-to-br from-primary-600 to-primary-400 text-white' 
                              : isTopRated 
                                ? 'bg-gradient-to-br from-warning-500 to-warning-600 text-white'
                                : 'bg-neutral-800 text-foreground-secondary'
                          }`}>
                            {business.isYou ? (
                              <FaStore size={16} />
                            ) : (
                              <FaBuilding size={16} />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-foreground">
                                {business.name}
                              </div>
                              {business.isYou && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-300">
                                  You
                                </span>
                              )}
                              {isTopRated && !business.isYou && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">
                                  <FaTrophy className="mr-1" size={8} />
                                  Top Rated
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-foreground-tertiary">
                              {business.category || 'Uncategorized'}
                            </div>
                            <div className="text-xs text-foreground-tertiary mt-1 flex items-center">
                              <FaMapMarkerAlt size={10} className="mr-1" />
                              {business.location || 'Unknown location'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="flex items-center mb-1">
                            <div className="text-sm font-medium text-foreground mr-2">
                              {business.rating ? business.rating.toFixed(1) : 'N/A'}
                            </div>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <FaStar 
                                  key={star} 
                                  size={12} 
                                  className={star <= Math.round(business.rating) ? 'text-amber-400' : 'text-neutral-600'} 
                                />
                              ))}
                            </div>
                          </div>
                          <div className="comparison-bar">
                            <div 
                              className={`comparison-bar-fill ${
                                business.isYou 
                                  ? 'bg-gradient-to-r from-primary-600 to-primary-400' 
                                  : isTopRated 
                                    ? 'bg-gradient-to-r from-warning-500 to-warning-400'
                                    : 'bg-neutral-600'
                              }`}
                              style={{ width: `${ratingPercentage}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-foreground mb-1">
                            {business.reviews ? business.reviews.toLocaleString() : 'N/A'}
                          </div>
                          <div className="comparison-bar">
                            <div 
                              className={`comparison-bar-fill ${
                                business.isYou 
                                  ? 'bg-gradient-to-r from-primary-600 to-primary-400' 
                                  : business.reviews >= (mostReviews * 0.8) 
                                    ? 'bg-gradient-to-r from-info-600 to-info-400'
                                    : 'bg-neutral-600'
                              }`}
                              style={{ width: `${reviewsPercentage}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {!business.isYou && (
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toggleCompetitorExpanded(index)}
                            className="px-3 py-1.5 rounded-lg text-xs bg-neutral-800 hover:bg-neutral-700 text-foreground-secondary flex items-center"
                          >
                            {isExpanded ? (
                              <>
                                <FaChevronUp className="mr-1" size={8} />
                                Hide Details
                              </>
                            ) : (
                              <>
                                <FaChevronDown className="mr-1" size={8} />
                                View Details
                              </>
                            )}
                          </motion.button>
                        )}
                        {business.isYou && (
                          <span className="px-3 py-1.5 rounded-lg text-xs bg-primary-900/20 text-primary-400 inline-block">
                            Your Business
                          </span>
                        )}
                      </td>
                    </tr>
                    
                    {/* Expanded Competitor Details */}
                    {isExpanded && !business.isYou && analysis && (
                      <tr className="bg-neutral-900">
                        <td colSpan={4} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="glass-panel p-4 rounded-xl border border-neutral-800">
                              <h4 className="text-sm font-medium text-foreground mb-3 flex items-center">
                                <FaThumbsUp className="text-success-500 mr-2" size={12} />
                                Competitor Strengths
                              </h4>
                              <ul className="space-y-2">
                                {analysis.strengths.map((strength, i) => (
                                  <li key={i} className="text-xs text-foreground-secondary flex items-start">
                                    <div className="flex-shrink-0 w-4 h-4 rounded-full bg-success-500/20 flex items-center justify-center mr-2 mt-0.5">
                                      <FaPlus className="text-success-500" size={8} />
                                    </div>
                                    {strength}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div className="glass-panel p-4 rounded-xl border border-neutral-800">
                              <h4 className="text-sm font-medium text-foreground mb-3 flex items-center">
                                <FaThumbsDown className="text-danger-500 mr-2" size={12} />
                                Competitor Weaknesses
                              </h4>
                              <ul className="space-y-2">
                                {analysis.weaknesses.map((weakness, i) => (
                                  <li key={i} className="text-xs text-foreground-secondary flex items-start">
                                    <div className="flex-shrink-0 w-4 h-4 rounded-full bg-danger-500/20 flex items-center justify-center mr-2 mt-0.5">
                                      <FaMinus className="text-danger-500" size={8} />
                                    </div>
                                    {weakness}
                                  </li>
                                ))}
                                {analysis.weaknesses.length === 0 && (
                                  <li className="text-xs text-foreground-tertiary">No significant weaknesses identified</li>
                                )}
                              </ul>
                            </div>
                          </div>
                          
                          <div className="flex justify-end mt-4">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => toggleCompetitorExpanded(index)}
                              className="px-3 py-1.5 rounded-lg text-xs bg-neutral-800 hover:bg-neutral-700 text-foreground-secondary flex items-center"
                            >
                              <FaChevronUp className="mr-1" size={10} />
                              Close Details
                            </motion.button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              
              {/* Empty state */}
              {allBusinesses.length <= 1 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center text-foreground-tertiary">
                      <FaSearch className="mb-3" size={24} />
                      <p className="text-sm mb-2">No competitors found for analysis</p>
                      <p className="text-xs">Try changing your search criteria or adding competitors manually</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
      </div>
      
      {/* Add Custom Competitor Button */}
      <div className="mt-6 flex justify-end">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddCompetitor(!showAddCompetitor)}
          className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-sm flex items-center shadow-md"
        >
          <FaPlus className="mr-2" size={12} />
          Add Custom Competitor
        </motion.button>
      </div>
      
      <div className="mt-4 text-xs text-gray-400 flex items-center">
        <FaInfoCircle className="mr-2" size={10} />
        Competitors are displayed from Google Places API, SerpAPI, or generated based on your business profile.
      </div>
    </motion.div>
  );
} 