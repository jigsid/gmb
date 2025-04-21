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
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-900/30 mr-3">
          <FaChartLine className="text-primary-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Performance Analytics</h2>
          <p className="text-sm text-foreground-tertiary">GMB data insights and market position</p>
        </div>
      </div>
      
      {/* Main metrics grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="bg-background-secondary rounded-xl p-5 shadow-card border border-neutral-700/20">
          <div className="flex justify-between mb-4">
            <div>
              <h3 className="text-foreground-secondary text-sm font-medium">Rating Comparison</h3>
              <p className="text-3xl font-bold text-foreground mt-1">
                {businessData.rating}
                <span className="text-sm font-normal text-foreground-tertiary ml-1">/ 5</span>
                
                {changeMetrics && (
                  <span className={`text-sm ml-2 ${changeMetrics.isRatingImproved ? 'text-success-500' : 'text-danger-500'}`}>
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
            <div className="w-full bg-background-tertiary rounded-full h-2.5">
              <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: `${(businessData.rating / 5) * 100}%` }}></div>
            </div>
          </div>
          
          <div className="flex justify-between mt-3 text-sm">
            <div className="text-foreground-tertiary">Competitors Avg: {avgCompetitorRating.toFixed(1)}</div>
            <div className={ratingDifference >= 0 ? "text-success-500" : "text-danger-500"}>
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
                {getRatingValues().map((item, i) => (
                  <div 
                    key={i} 
                    className={`w-full ${i === getRatingValues().length - 1 ? 'bg-amber-500' : 'bg-amber-700/50'} rounded-sm`}
                    style={{ height: `${item.height}%` }}
                  ></div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-background-secondary rounded-xl p-5 shadow-card border border-neutral-700/20">
          <div className="flex justify-between mb-4">
            <div>
              <h3 className="text-foreground-secondary text-sm font-medium">Review Volume</h3>
              <p className="text-3xl font-bold text-foreground mt-1">
                {businessData.reviews.toLocaleString()}
                
                {changeMetrics && (
                  <span className={`text-sm ml-2 ${changeMetrics.isReviewsImproved ? 'text-success-500' : 'text-danger-500'}`}>
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
            <div className="w-full bg-background-tertiary rounded-full h-2.5">
              <div className="bg-primary-500 h-2.5 rounded-full" style={{ 
                width: `${Math.min((businessData.reviews / (avgCompetitorReviews * 2 || 100)) * 100, 100)}%` 
              }}></div>
            </div>
          </div>
          
          <div className="flex justify-between mt-3 text-sm">
            <div className="text-foreground-tertiary">Competitors Avg: {Math.round(avgCompetitorReviews)}</div>
            <div className={reviewsDifference >= 0 ? "text-success-500" : "text-danger-500"}>
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
                {getReviewCounts().map((item, i) => (
                  <div 
                    key={i} 
                    className={`w-full ${i === getReviewCounts().length - 1 ? 'bg-primary-500' : 'bg-primary-700/50'} rounded-sm`}
                    style={{ height: `${item.height}%` }}
                  ></div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-background-secondary rounded-xl p-5 shadow-card border border-neutral-700/20">
          <div className="flex justify-between mb-4">
            <div>
              <h3 className="text-foreground-secondary text-sm font-medium">Market Position</h3>
              <p className="text-3xl font-bold text-foreground mt-1">
                {Math.round(marketPositionPercentage)}%
              </p>
            </div>
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-success-900/30 flex items-center justify-center">
              <FaMapMarkerAlt className="text-success-500" />
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-full bg-background-tertiary rounded-full h-2.5">
              <div className="bg-success-500 h-2.5 rounded-full" style={{ width: `${marketPositionPercentage}%` }}></div>
            </div>
          </div>
          
          <div className="flex justify-between mt-3 text-sm">
            <div className="text-foreground-tertiary">Based on rating & reviews</div>
            <div className="text-success-500">
              {marketPositionPercentage >= 75 ? "Leading" : 
               marketPositionPercentage >= 50 ? "Strong" : 
               marketPositionPercentage >= 25 ? "Average" : "Needs work"}
            </div>
          </div>
          
          {/* Month-over-month growth */}
          <div className="mt-4 pt-4 border-t border-neutral-700/30">
            <div className="text-xs text-foreground-tertiary mb-2">Month-over-Month Growth</div>
            <div className="flex items-center">
              <div className={`text-xl font-bold ${getGrowthRate() >= 0 ? 'text-success-500' : 'text-danger-500'}`}>
                {getGrowthRate() > 0 ? '+' : ''}{getGrowthRate()}%
              </div>
              <div className={`ml-2 p-1 rounded-full ${getGrowthRate() >= 0 ? 'bg-success-500/20' : 'bg-danger-500/20'}`}>
                {getGrowthRate() >= 0 ? 
                  <FaArrowUp className="text-success-500" size={10} /> : 
                  <FaArrowDown className="text-danger-500" size={10} />
                }
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Historical data visualization */}
      {!isLoading && historicalData && (
        <div className="bg-background-secondary rounded-xl p-5 shadow-card mb-6 border border-neutral-700/20">
          <h3 className="text-lg font-semibold text-foreground mb-5">Performance Trends</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-foreground-secondary mb-3">Rating History</h4>
              <div className="bg-background-tertiary p-4 rounded-lg">
                <div className="h-48 flex items-end space-x-1">
                  {getRatingValues().map((item, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div 
                        className={`w-full relative group ${i === getRatingValues().length - 1 ? 'bg-gradient-to-t from-amber-500 to-amber-400' : 'bg-gradient-to-t from-amber-700/60 to-amber-600/60'} rounded-t-sm`} 
                        style={{ height: `${item.height}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-amber-500 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {item.value.toFixed(1)}★
                        </div>
                      </div>
                      <div className="w-full flex justify-center mt-2">
                        <span className="text-xs text-foreground-tertiary">{item.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground-secondary mb-3">Review Growth</h4>
              <div className="bg-background-tertiary p-4 rounded-lg">
                <div className="h-48 flex items-end space-x-1">
                  {getReviewCounts().map((item, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div 
                        className={`w-full relative group ${i === getReviewCounts().length - 1 ? 'bg-gradient-to-t from-primary-500 to-primary-400' : 'bg-gradient-to-t from-primary-700/60 to-primary-600/60'} rounded-t-sm`} 
                        style={{ height: `${item.height}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-primary-500 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {item.value}
                        </div>
                      </div>
                      <div className="w-full flex justify-center mt-2">
                        <span className="text-xs text-foreground-tertiary">{item.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Key performance indicators */}
      <div className="bg-background-secondary rounded-xl p-5 mb-6 shadow-card border border-neutral-700/20">
        <h3 className="text-lg font-semibold text-foreground mb-5">Key Performance Indicators</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
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
      <div className="bg-background-secondary rounded-xl p-5 shadow-card border border-neutral-700/20">
        <h3 className="text-lg font-semibold text-foreground mb-5">Quick Recommendations</h3>
        <ul className="space-y-4">
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
  let colorClass = "text-foreground";
  if (isPositive) colorClass = "text-success-500";
  if (isNegative) colorClass = "text-danger-500";
  if (isNeutral) colorClass = "text-primary-500";
  
  return (
    <div className="bg-background-tertiary p-4 rounded-lg shadow-sm border border-neutral-700/10 hover:border-neutral-700/30 transition-colors">
      <h4 className="text-xs font-medium text-foreground-tertiary mb-1">{title}</h4>
      <p className={`text-xl font-bold ${colorClass}`}>{value}</p>
      <p className="text-xs text-foreground-tertiary mt-1">{description}</p>
    </div>
  );
}

function RecommendationItem({ children }) {
  return (
    <li className="flex items-start p-3 rounded-lg bg-background-tertiary border border-neutral-700/10 hover:border-primary-500/20 transition-colors">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center mt-0.5 mr-3">
        <FaRegCalendarAlt className="text-primary-500" size={12} />
      </div>
      <span className="text-sm text-foreground">{children}</span>
    </li>
  );
} 