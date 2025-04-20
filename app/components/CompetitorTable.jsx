import { useState } from 'react';
import { FaStar, FaExternalLinkAlt, FaTrophy, FaBuilding, FaChartBar, FaSortAmountDown, FaSortAmountUp, FaFilter } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function CompetitorTable({ businessData, competitors, seoData }) {
  // Handle missing or invalid data
  if (!businessData) return null;
  
  // Ensure competitors is always an array
  const competitorsList = Array.isArray(competitors) ? competitors : [];
  
  // State for sorting
  const [sortField, setSortField] = useState('rating');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Function to handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  // Sort competitors
  const sortedCompetitors = [...competitorsList].sort((a, b) => {
    // Handle missing values
    if (!a[sortField] && !b[sortField]) return 0;
    if (!a[sortField]) return 1;
    if (!b[sortField]) return -1;
    
    // Compare values
    const comparison = a[sortField] > b[sortField] ? 1 : -1;
    return sortDirection === 'asc' ? comparison : -comparison;
  });
  
  // All businesses including yours for comparison
  const allBusinesses = [
    { ...businessData, isYou: true },
    ...sortedCompetitors
  ];
  
  // Find the best rating
  const bestRating = Math.max(...allBusinesses.map(b => b.rating || 0));
  const mostReviews = Math.max(...allBusinesses.map(b => b.reviews || 0));

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
            <p className="text-sm text-foreground-tertiary">{competitorsList.length} competitors analyzed</p>
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
        </div>
      </div>
      
      {competitorsList.length === 0 ? (
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
                  Website
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
                
                return (
                  <motion.tr 
                    key={index} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + (index * 0.05) }}
                    className={`
                      ${business.isYou ? 'bg-primary-900/20' : 'hover:bg-neutral-800/50'}
                      transition-colors
                    `}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full mr-3 ${
                          business.isYou 
                            ? 'bg-primary-900/50 text-primary-500' 
                            : isTopRated 
                              ? 'bg-amber-900/50 text-amber-500'
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
                          </div>
                          <div className="text-xs text-foreground-tertiary mt-1">{business.address || business.location || ''}</div>
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
                        >
                          <FaExternalLinkAlt className="mr-1.5" size={10} />
                          {/* Safely extract domain from website URL */}
                          {(business.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]) || 'website'}
                        </motion.a>
                      ) : (
                        <span className="text-foreground-tertiary text-xs">Not available</span>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      
      {(competitorsList.some(c => c.isEstimated) || (seoData && seoData.isEstimated)) && (
        <p className="text-xs text-foreground-tertiary mt-4 italic">
          * Some metrics are estimated when direct data is not available.
        </p>
      )}
    </motion.div>
  );
} 