import { FaChartLine, FaPieChart, FaGlobe, FaMapMarkerAlt, FaRegCalendarAlt, FaArrowUp, FaArrowDown, FaStar, FaComments, FaUsers, FaThumbsUp } from 'react-icons/fa';
import { motion } from 'framer-motion';
import useGmbDataTracking from '../hooks/useGmbDataTracking';

export default function GmbAnalyticsDashboard({ businessData, seoData, competitors }) {
  if (!businessData) return null;
  
  // Use the GMB tracking hook to get historical data
  const { 
    historicalData, 
    changeMetrics, 
    isLoading, 
    getGrowthRate,
    getMonthLabels,
    getReviewCounts,
    getRatingValues
  } = useGmbDataTracking(businessData);
  
  // Calculate comparative metrics
  const avgCompetitorRating = competitors && competitors.length > 0 
    ? competitors.reduce((sum, comp) => sum + (comp.rating || 0), 0) / competitors.length 
    : 0;
    
  const avgCompetitorReviews = competitors && competitors.length > 0 
    ? competitors.reduce((sum, comp) => sum + (comp.reviews || 0), 0) / competitors.length 
    : 0;
    
  const ratingDifference = businessData.rating - avgCompetitorRating;
  const reviewsDifference = businessData.reviews - avgCompetitorReviews;
  
  // Calculate market position percentage (simple metric based on rating and reviews)
  const marketPositionPercentage = competitors && competitors.length > 0
    ? Math.min(100, Math.max(0, (
        ((businessData.rating / 5) * 0.6) + 
        ((businessData.reviews / (avgCompetitorReviews * 2 || 1)) * 0.4)
      ) * 100))
    : 75; // Default value if no competitors
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full glass-card p-6 rounded-2xl border border-card-border shadow-float backdrop-blur-sm"
    >
      <div className="flex items-center mb-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-900/30 mr-3">
          <FaChartLine className="text-blue-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Performance Analytics</h2>
          <p className="text-sm text-foreground-tertiary">GMB data insights and market position</p>
        </div>
      </div>
      
      {/* Main metrics grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="bg-neutral-800 rounded-lg p-5 shadow-sm">
          <div className="flex justify-between mb-4">
            <div>
              <h3 className="text-foreground-secondary text-sm font-medium">Rating Comparison</h3>
              <p className="text-3xl font-bold text-foreground mt-1">
                {businessData.rating}
                <span className="text-sm font-normal text-foreground-tertiary ml-1">/ 5</span>
                
                {changeMetrics && (
                  <span className={`text-sm ml-2 ${changeMetrics.isRatingImproved ? 'text-green-500' : 'text-red-500'}`}>
                    {changeMetrics.ratingChange > 0 ? '+' : ''}
                    {changeMetrics.ratingChange.toFixed(1)}
                    {changeMetrics.isRatingImproved ? <FaArrowUp className="inline ml-1 mb-1" size={10} /> : <FaArrowDown className="inline ml-1 mb-1" size={10} />}
                  </span>
                )}
              </p>
            </div>
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-900/30 flex items-center justify-center">
              <FaStar className="text-amber-500" />
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: `${(businessData.rating / 5) * 100}%` }}></div>
            </div>
          </div>
          
          <div className="flex justify-between mt-3 text-sm">
            <div className="text-foreground-tertiary">Competitors Avg: {avgCompetitorRating.toFixed(1)}</div>
            <div className={ratingDifference >= 0 ? "text-green-500" : "text-red-500"}>
              {ratingDifference > 0 ? "+" : ""}{ratingDifference.toFixed(1)}
            </div>
          </div>
          
          {/* Historical rating mini chart */}
          {!isLoading && historicalData && (
            <div className="mt-4 h-10">
              <div className="flex justify-between text-xs text-foreground-tertiary mb-1">
                <span>Rating Trend</span>
                <span>Past 6 months</span>
              </div>
              <div className="flex items-end h-6 space-x-1">
                {getRatingValues().map((value, i) => (
                  <div 
                    key={i} 
                    className={`w-full ${i === getRatingValues().length - 1 ? 'bg-amber-500' : 'bg-amber-700/50'} rounded-sm`}
                    style={{ height: `${(value / 5) * 100}%` }}
                  ></div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-neutral-800 rounded-lg p-5 shadow-sm">
          <div className="flex justify-between mb-4">
            <div>
              <h3 className="text-foreground-secondary text-sm font-medium">Review Volume</h3>
              <p className="text-3xl font-bold text-foreground mt-1">
                {businessData.reviews.toLocaleString()}
                
                {changeMetrics && (
                  <span className={`text-sm ml-2 ${changeMetrics.isReviewsImproved ? 'text-green-500' : 'text-red-500'}`}>
                    {changeMetrics.reviewsChange > 0 ? '+' : ''}
                    {changeMetrics.reviewsChange}
                    {changeMetrics.isReviewsImproved ? <FaArrowUp className="inline ml-1 mb-1" size={10} /> : <FaArrowDown className="inline ml-1 mb-1" size={10} />}
                  </span>
                )}
              </p>
            </div>
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-900/30 flex items-center justify-center">
              <FaComments className="text-primary-500" />
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div className="bg-primary-500 h-2.5 rounded-full" style={{ 
                width: `${Math.min((businessData.reviews / (avgCompetitorReviews * 2 || 100)) * 100, 100)}%` 
              }}></div>
            </div>
          </div>
          
          <div className="flex justify-between mt-3 text-sm">
            <div className="text-foreground-tertiary">Competitors Avg: {Math.round(avgCompetitorReviews)}</div>
            <div className={reviewsDifference >= 0 ? "text-green-500" : "text-red-500"}>
              {reviewsDifference > 0 ? "+" : ""}{reviewsDifference.toFixed(0)}
            </div>
          </div>
          
          {/* Historical reviews mini chart */}
          {!isLoading && historicalData && (
            <div className="mt-4 h-10">
              <div className="flex justify-between text-xs text-foreground-tertiary mb-1">
                <span>Review Growth</span>
                <span>Past 6 months</span>
              </div>
              <div className="flex items-end h-6 space-x-1">
                {getReviewCounts().map((count, i) => {
                  const maxCount = Math.max(...getReviewCounts());
                  return (
                    <div 
                      key={i} 
                      className={`w-full ${i === getReviewCounts().length - 1 ? 'bg-primary-500' : 'bg-primary-700/50'} rounded-sm`}
                      style={{ height: `${(count / maxCount) * 100}%` }}
                    ></div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-neutral-800 rounded-lg p-5 shadow-sm">
          <div className="flex justify-between mb-4">
            <div>
              <h3 className="text-foreground-secondary text-sm font-medium">Market Position</h3>
              <p className="text-3xl font-bold text-foreground mt-1">
                {Math.round(marketPositionPercentage)}%
              </p>
            </div>
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-900/30 flex items-center justify-center">
              <FaMapMarkerAlt className="text-green-500" />
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${marketPositionPercentage}%` }}></div>
            </div>
          </div>
          
          <div className="flex justify-between mt-3 text-sm">
            <div className="text-foreground-tertiary">Based on rating & reviews</div>
            <div className="text-green-500">
              {marketPositionPercentage >= 75 ? "Leading" : 
               marketPositionPercentage >= 50 ? "Strong" : 
               marketPositionPercentage >= 25 ? "Average" : "Needs work"}
            </div>
          </div>
          
          {/* Month-over-month growth */}
          <div className="mt-4 pt-4 border-t border-neutral-700">
            <div className="text-xs text-foreground-tertiary mb-2">Month-over-Month Growth</div>
            <div className="flex items-center">
              <div className={`text-xl font-bold ${getGrowthRate() >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {getGrowthRate() > 0 ? '+' : ''}{getGrowthRate()}%
              </div>
              <div className={`ml-2 p-1 rounded-full ${getGrowthRate() >= 0 ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
                {getGrowthRate() >= 0 ? 
                  <FaArrowUp className="text-green-500" size={10} /> : 
                  <FaArrowDown className="text-red-500" size={10} />
                }
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Historical data visualization */}
      {!isLoading && historicalData && (
        <div className="bg-neutral-800 rounded-lg p-5 shadow-sm mb-6">
          <h3 className="text-lg font-medium text-foreground mb-4">Performance Trends</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-foreground-secondary mb-2">Rating History</h4>
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="h-40 flex items-end space-x-2">
                  {getRatingValues().map((value, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div className="w-full flex justify-center mb-1">
                        <span className="text-xs text-foreground-tertiary">{value.label}</span>
                      </div>
                      <div 
                        className={`w-full ${i === getRatingValues().length - 1 ? 'bg-amber-500' : 'bg-amber-700/50'} rounded-t-sm`} 
                        style={{ height: `${value.height}%` }}
                      ></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground-secondary mb-2">Review Growth</h4>
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="h-40 flex items-end space-x-2">
                  {getReviewCounts().map((value, i) => {
                    const maxCount = Math.max(...getReviewCounts());
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div className="w-full flex justify-center mb-1">
                          <span className="text-xs text-foreground-tertiary">{value.label}</span>
                        </div>
                        <div 
                          className={`w-full ${i === getReviewCounts().length - 1 ? 'bg-primary-500' : 'bg-primary-700/50'} rounded-t-sm`} 
                          style={{ height: `${value.height}%` }}
                        ></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Key performance indicators */}
      <div className="bg-neutral-800 rounded-lg p-5 mb-6">
        <h3 className="text-lg font-medium text-foreground mb-4">Key Performance Indicators</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard 
            title="Review Growth"
            value={`${getGrowthRate() > 0 ? '+' : ''}${getGrowthRate()}%`}
            description="Month over month"
            isPositive={getGrowthRate() > 0}
            isNegative={getGrowthRate() < 0}
            isNeutral={getGrowthRate() === 0}
          />
          
          <KpiCard 
            title="Rating Trend"
            value={changeMetrics?.ratingChange === 0 ? "Stable" : 
                   changeMetrics?.isRatingImproved ? "Improving" : "Declining"}
            description={changeMetrics ? `${changeMetrics.ratingChange > 0 ? '+' : ''}${changeMetrics.ratingChange.toFixed(1)} points` : "No change"}
            isPositive={changeMetrics?.isRatingImproved}
            isNegative={changeMetrics?.ratingChange < 0}
            isNeutral={!changeMetrics || changeMetrics.ratingChange === 0}
          />
          
          <KpiCard 
            title="Photos"
            value={businessData.photos || "5"}
            description="Business images"
            isNeutral={true}
          />
          
          <KpiCard 
            title="Categories"
            value={businessData.categoryCount || "1"}
            description="Business categories"
            isNeutral={true}
          />
        </div>
      </div>
      
      {/* Recommendations */}
      <div className="bg-neutral-800 rounded-lg p-5">
        <h3 className="text-lg font-medium text-foreground mb-4">Quick Recommendations</h3>
        <ul className="space-y-2">
          {businessData.reviews < 10 && (
            <RecommendationItem>
              Encourage customers to leave reviews to improve visibility
            </RecommendationItem>
          )}
          {businessData.rating < 4.0 && (
            <RecommendationItem>
              Focus on improving customer experience to boost your rating
            </RecommendationItem>
          )}
          {(!businessData.website || businessData.website.length < 5) && (
            <RecommendationItem>
              Add your website URL to your Google My Business profile
            </RecommendationItem>
          )}
          {changeMetrics && changeMetrics.reviewsChangePercent < 5 && (
            <RecommendationItem>
              Your review growth is slowing. Consider a review generation campaign.
            </RecommendationItem>
          )}
          {businessData.reviews > 0 && (
            <RecommendationItem>
              Respond to customer reviews to improve engagement
            </RecommendationItem>
          )}
          {(seoData && seoData.domainAuthority < 30) && (
            <RecommendationItem>
              Improve your website's SEO to boost online visibility
            </RecommendationItem>
          )}
          <RecommendationItem>
            Keep your business information up-to-date for better search rankings
          </RecommendationItem>
        </ul>
      </div>
    </motion.div>
  );
}

function KpiCard({ title, value, description, isPositive, isNegative, isNeutral }) {
  let colorClass = "text-neutral-500";
  if (isPositive) colorClass = "text-green-500";
  if (isNegative) colorClass = "text-red-500";
  if (isNeutral) colorClass = "text-blue-500";
  
  return (
    <div className="bg-neutral-800 p-3 rounded-lg shadow-sm">
      <h4 className="text-xs font-medium text-foreground-tertiary mb-1">{title}</h4>
      <p className={`text-xl font-bold ${colorClass}`}>{value}</p>
      <p className="text-xs text-foreground-tertiary mt-1">{description}</p>
    </div>
  );
}

function RecommendationItem({ children }) {
  return (
    <li className="flex items-start">
      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-900/30 flex items-center justify-center mt-0.5 mr-2">
        <FaRegCalendarAlt className="text-primary-500" size={10} />
      </div>
      <span className="text-sm text-foreground-secondary">{children}</span>
    </li>
  );
} 