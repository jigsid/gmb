import { useState, useEffect } from 'react';
import { FaChartLine, FaStar, FaComments, FaUsers, FaArrowUp, FaArrowDown, FaEquals, FaTrophy, FaMedal, FaStore, FaInfoCircle, FaLink, FaLocationArrow } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function CompetitorAnalytics({ businessData, competitors, seoData }) {
  const [competitorMetrics, setCompetitorMetrics] = useState({
    averageRating: 0,
    averageReviews: 0,
    topCompetitor: null,
    ratingDifference: 0,
    reviewsDifference: 0,
    competitivePosition: '',
    strengthScore: 0,
  });
  
  const [competitorInsights, setCompetitorInsights] = useState([]);
  const [selectedCompetitor, setSelectedCompetitor] = useState(null);
  const [competitorComparison, setCompetitorComparison] = useState(null);
  
  useEffect(() => {
    if (businessData && competitors && competitors.length > 0) {
      analyzeCompetitors();
      generateInsights();
    }
  }, [businessData, competitors]);
  
  // Calculate competitor metrics and your position relative to competitors
  const analyzeCompetitors = () => {
    // Calculate competitor metrics
    const totalRating = competitors.reduce((sum, comp) => sum + (comp.rating || 0), 0);
    const totalReviews = competitors.reduce((sum, comp) => sum + (comp.reviews || 0), 0);
    const avgRating = totalRating / competitors.length;
    const avgReviews = totalReviews / competitors.length;
    
    // Find top competitor by rating
    const topCompetitor = [...competitors].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
    
    // Calculate difference between your business and competitors
    const ratingDiff = (businessData.rating || 0) - avgRating;
    const reviewsDiff = (businessData.reviews || 0) - avgReviews;
    
    // Determine competitive position
    let position = '';
    let strengthScore = 0;
    
    if (ratingDiff > 0.5 && reviewsDiff > 20) {
      position = 'Market Leader';
      strengthScore = 90;
    } else if (ratingDiff > 0.2 && reviewsDiff > 0) {
      position = 'Strong Performer';
      strengthScore = 75;
    } else if (ratingDiff > 0 && reviewsDiff > -10) {
      position = 'Competitive';
      strengthScore = 60;
    } else if (ratingDiff > -0.3) {
      position = 'Challenger';
      strengthScore = 45;
    } else {
      position = 'Needs Improvement';
      strengthScore = 30;
    }
    
    setCompetitorMetrics({
      averageRating: avgRating.toFixed(1),
      averageReviews: Math.round(avgReviews),
      topCompetitor,
      ratingDifference: ratingDiff.toFixed(1),
      reviewsDifference: Math.round(reviewsDiff),
      competitivePosition: position,
      strengthScore
    });
  };
  
  // Generate insights based on competitor analysis
  const generateInsights = () => {
    const insights = [];
    
    // Rating insights
    if (businessData.rating < 4.0) {
      insights.push({
        category: 'rating',
        type: 'warning',
        title: 'Rating Improvement Needed',
        description: 'Your rating is below 4.0, which can affect customer decisions. Focus on improving customer experience and service quality.'
      });
    }
    
    // Reviews insights
    const avgCompetitorReviews = competitors.reduce((sum, comp) => sum + (comp.reviews || 0), 0) / competitors.length;
    if (businessData.reviews < avgCompetitorReviews * 0.8) {
      insights.push({
        category: 'reviews',
        type: 'warning',
        title: 'Fewer Reviews Than Competitors',
        description: `You have ${Math.round(avgCompetitorReviews - businessData.reviews)} fewer reviews than the average competitor. Encourage satisfied customers to leave reviews.`
      });
    }
    
    // Top competitor insights
    const topCompetitor = [...competitors].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
    if (topCompetitor && businessData.rating < topCompetitor.rating) {
      insights.push({
        category: 'competition',
        type: 'info',
        title: `Top Competitor: ${topCompetitor.name}`,
        description: `This competitor has a ${topCompetitor.rating} rating with ${topCompetitor.reviews} reviews. Analyze their business strategies to identify areas for improvement.`
      });
    }
    
    // SEO insights
    if (seoData && seoData.rankingKeywords < 50) {
      insights.push({
        category: 'seo',
        type: 'warning',
        title: 'SEO Visibility Gap',
        description: 'Your business has low keyword visibility. Create content targeting relevant keywords to improve online visibility.'
      });
    }
    
    // Positive insights
    if (businessData.rating > 4.3) {
      insights.push({
        category: 'rating',
        type: 'success',
        title: 'Strong Customer Satisfaction',
        description: 'Your high rating indicates strong customer satisfaction. Maintain service quality and highlight this in your marketing.'
      });
    }
    
    setCompetitorInsights(insights);
  };
  
  // Compare with a specific competitor
  const compareWithCompetitor = (competitor) => {
    if (!competitor) return null;
    
    setSelectedCompetitor(competitor);
    
    // Calculate rating difference
    const ratingDiff = (businessData.rating || 0) - (competitor.rating || 0);
    
    // Calculate reviews difference
    const reviewsDiff = (businessData.reviews || 0) - (competitor.reviews || 0);
    
    // Determine strengths and weaknesses
    const strengths = [];
    const weaknesses = [];
    
    // Rating comparison
    if (ratingDiff >= 0.2) {
      strengths.push(`Higher rating (${businessData.rating} vs ${competitor.rating})`);
    } else if (ratingDiff <= -0.2) {
      weaknesses.push(`Lower rating (${businessData.rating} vs ${competitor.rating})`);
    }
    
    // Reviews comparison
    if (reviewsDiff > 20) {
      strengths.push(`More reviews (${businessData.reviews} vs ${competitor.reviews})`);
    } else if (reviewsDiff < -20) {
      weaknesses.push(`Fewer reviews (${businessData.reviews} vs ${competitor.reviews})`);
    }
    
    // SEO comparison (if available)
    if (seoData && seoData.domainAuthority) {
      strengths.push(`Website presence with SEO metrics`);
    }
    
    // Generic strength if there are none
    if (strengths.length === 0) {
      strengths.push('Similar market presence to competitor');
    }
    
    setCompetitorComparison({
      competitor,
      ratingDifference: ratingDiff.toFixed(1),
      reviewsDifference: reviewsDiff,
      strengths,
      weaknesses,
      suggestions: generateSuggestionsForCompetitor(competitor)
    });
  };
  
  // Generate suggestions based on competitor
  const generateSuggestionsForCompetitor = (competitor) => {
    const suggestions = [];
    
    // Rating-based suggestions
    if ((businessData.rating || 0) < (competitor.rating || 0)) {
      suggestions.push('Focus on improving customer experience to increase rating');
      suggestions.push('Analyze negative reviews to identify areas for improvement');
    }
    
    // Reviews-based suggestions
    if ((businessData.reviews || 0) < (competitor.reviews || 0)) {
      suggestions.push('Implement a review encouragement program for satisfied customers');
      suggestions.push('Respond promptly to all reviews, both positive and negative');
    }
    
    // Generic suggestions
    suggestions.push('Study competitor\'s online presence and service offerings');
    suggestions.push('Highlight your unique selling points in marketing materials');
    
    return suggestions;
  };
  
  if (!businessData || !competitors || competitors.length === 0) {
    return null;
  }
  
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
          <h2 className="text-xl font-bold text-foreground">Competitor Analytics</h2>
          <p className="text-sm text-foreground-tertiary">Insights based on {competitors.length} competitors</p>
        </div>
      </div>
      
      {/* Competitive Position Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <div className="glass-panel p-4 rounded-xl border border-neutral-800">
          <div className="text-xs uppercase text-foreground-tertiary mb-1 flex items-center">
            <FaTrophy className="mr-1" size={10} />
            Competitive Position
          </div>
          <div className="text-xl font-bold text-foreground mb-1">{competitorMetrics.competitivePosition}</div>
          <div className="w-full bg-neutral-700 rounded-full h-2 overflow-hidden mt-2">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${competitorMetrics.strengthScore}%` }}
              transition={{ duration: 1 }}
              className="h-full rounded-full bg-primary-500"
            />
          </div>
          <div className="text-xs text-foreground-tertiary mt-1">Strength Score: {competitorMetrics.strengthScore}%</div>
        </div>
        
        <div className="glass-panel p-4 rounded-xl border border-neutral-800">
          <div className="text-xs uppercase text-foreground-tertiary mb-1 flex items-center">
            <FaStar className="mr-1" size={10} />
            Rating Comparison
          </div>
          <div className="flex items-center">
            <div className="text-xl font-bold text-foreground mb-1">
              {businessData.rating || 'N/A'}
            </div>
            <div className="ml-2 flex items-center">
              {competitorMetrics.ratingDifference > 0 ? (
                <span className="text-green-500 flex items-center text-sm">
                  <FaArrowUp size={10} className="mr-1" />
                  {Math.abs(competitorMetrics.ratingDifference)}
                </span>
              ) : competitorMetrics.ratingDifference < 0 ? (
                <span className="text-red-500 flex items-center text-sm">
                  <FaArrowDown size={10} className="mr-1" />
                  {Math.abs(competitorMetrics.ratingDifference)}
                </span>
              ) : (
                <span className="text-gray-500 flex items-center text-sm">
                  <FaEquals size={10} className="mr-1" />
                  0
                </span>
              )}
            </div>
          </div>
          <div className="text-xs text-foreground-tertiary">vs. Competitor Avg: {competitorMetrics.averageRating}</div>
        </div>
        
        <div className="glass-panel p-4 rounded-xl border border-neutral-800">
          <div className="text-xs uppercase text-foreground-tertiary mb-1 flex items-center">
            <FaComments className="mr-1" size={10} />
            Reviews Comparison
          </div>
          <div className="flex items-center">
            <div className="text-xl font-bold text-foreground mb-1">
              {businessData.reviews?.toLocaleString() || 'N/A'}
            </div>
            <div className="ml-2 flex items-center">
              {competitorMetrics.reviewsDifference > 0 ? (
                <span className="text-green-500 flex items-center text-sm">
                  <FaArrowUp size={10} className="mr-1" />
                  {Math.abs(competitorMetrics.reviewsDifference)}
                </span>
              ) : competitorMetrics.reviewsDifference < 0 ? (
                <span className="text-red-500 flex items-center text-sm">
                  <FaArrowDown size={10} className="mr-1" />
                  {Math.abs(competitorMetrics.reviewsDifference)}
                </span>
              ) : (
                <span className="text-gray-500 flex items-center text-sm">
                  <FaEquals size={10} className="mr-1" />
                  0
                </span>
              )}
            </div>
          </div>
          <div className="text-xs text-foreground-tertiary">vs. Competitor Avg: {competitorMetrics.averageReviews}</div>
        </div>
        
        <div className="glass-panel p-4 rounded-xl border border-neutral-800">
          <div className="text-xs uppercase text-foreground-tertiary mb-1 flex items-center">
            <FaMedal className="mr-1" size={10} />
            Top Competitor
          </div>
          {competitorMetrics.topCompetitor ? (
            <>
              <div className="text-lg font-bold text-foreground mb-1 truncate" title={competitorMetrics.topCompetitor.name}>
                {competitorMetrics.topCompetitor.name}
              </div>
              <div className="flex items-center text-xs text-foreground-tertiary">
                <div className="flex items-center mr-2">
                  <FaStar className="text-amber-400 mr-1" size={10} />
                  {competitorMetrics.topCompetitor.rating || 'N/A'}
                </div>
                <div className="flex items-center">
                  <FaComments className="text-neutral-400 mr-1" size={10} />
                  {competitorMetrics.topCompetitor.reviews?.toLocaleString() || 'N/A'}
                </div>
              </div>
              <button
                onClick={() => compareWithCompetitor(competitorMetrics.topCompetitor)}
                className="text-xs text-primary-400 hover:text-primary-300 mt-2 flex items-center"
              >
                Analyze This Competitor
                <FaInfoCircle className="ml-1" size={10} />
              </button>
            </>
          ) : (
            <div className="text-sm text-foreground-tertiary">No competitor data available</div>
          )}
        </div>
      </div>
      
      {/* Insights Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-3">Competitive Insights</h3>
        
        {competitorInsights.length === 0 ? (
          <div className="text-foreground-tertiary text-sm">No insights available.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {competitorInsights.map((insight, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-xl border ${
                  insight.type === 'warning' 
                    ? 'border-amber-800/40 bg-amber-900/10' 
                    : insight.type === 'success'
                      ? 'border-green-800/40 bg-green-900/10'
                      : 'border-blue-800/40 bg-blue-900/10'
                }`}
              >
                <h4 className={`text-sm font-medium mb-1 ${
                  insight.type === 'warning' 
                    ? 'text-amber-400' 
                    : insight.type === 'success'
                      ? 'text-green-400'
                      : 'text-blue-400'
                }`}>
                  {insight.title}
                </h4>
                <p className="text-xs text-foreground-tertiary">{insight.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Competitor Comparison Section */}
      {selectedCompetitor && competitorComparison && (
        <div className="rounded-xl border border-neutral-800 p-4 bg-neutral-900/50 mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
            <FaStore className="mr-2" size={16} />
            Competitor Analysis: {selectedCompetitor.name}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <h4 className="text-sm font-medium text-foreground-secondary mb-2">Business Details</h4>
              <div className="space-y-2 text-sm">
                {selectedCompetitor.address && (
                  <div className="flex items-start">
                    <FaLocationArrow className="text-neutral-400 mt-1 mr-2" size={12} />
                    <div>
                      <span className="text-foreground-tertiary">Location:</span>
                      <span className="ml-2 text-foreground">{selectedCompetitor.address}</span>
                    </div>
                  </div>
                )}
                
                {selectedCompetitor.category && (
                  <div className="flex items-start">
                    <FaStore className="text-neutral-400 mt-1 mr-2" size={12} />
                    <div>
                      <span className="text-foreground-tertiary">Category:</span>
                      <span className="ml-2 text-foreground">{selectedCompetitor.category}</span>
                    </div>
                  </div>
                )}
                
                {selectedCompetitor.website && (
                  <div className="flex items-start">
                    <FaLink className="text-neutral-400 mt-1 mr-2" size={12} />
                    <div>
                      <span className="text-foreground-tertiary">Website:</span>
                      <a 
                        href={selectedCompetitor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-primary-400 hover:underline"
                      >
                        {selectedCompetitor.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-foreground-secondary mb-2">
                Your Strengths
              </h4>
              <ul className="space-y-1">
                {competitorComparison.strengths.map((strength, idx) => (
                  <li key={idx} className="text-xs text-green-300 flex items-start">
                    <FaArrowUp className="text-green-500 mt-1 mr-2" size={10} />
                    {strength}
                  </li>
                ))}
              </ul>
              
              {competitorComparison.weaknesses.length > 0 && (
                <>
                  <h4 className="text-sm font-medium text-foreground-secondary mt-4 mb-2">
                    Areas to Improve
                  </h4>
                  <ul className="space-y-1">
                    {competitorComparison.weaknesses.map((weakness, idx) => (
                      <li key={idx} className="text-xs text-red-300 flex items-start">
                        <FaArrowDown className="text-red-500 mt-1 mr-2" size={10} />
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-foreground-secondary mb-2">
                Recommended Actions
              </h4>
              <ul className="space-y-1">
                {competitorComparison.suggestions.map((suggestion, idx) => (
                  <li key={idx} className="text-xs text-blue-300 flex items-start">
                    <div className="bg-blue-500/20 p-1 rounded-full mr-2 mt-0.5">
                      <span className="block w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    </div>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={() => setSelectedCompetitor(null)}
              className="text-xs text-foreground-tertiary hover:text-foreground transition-colors"
            >
              Close Analysis
            </button>
          </div>
        </div>
      )}
      
      {/* Competitor Selection */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">Analyze Other Competitors</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {competitors.map((competitor, index) => (
            <button
              key={index}
              onClick={() => compareWithCompetitor(competitor)}
              className="p-3 rounded-xl border border-neutral-800 hover:border-primary-700 bg-neutral-900/50 hover:bg-neutral-800/50 transition-colors text-left"
            >
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center mr-2">
                  <FaStore className="text-neutral-500" size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate" title={competitor.name}>
                    {competitor.name}
                  </div>
                  <div className="flex items-center text-xs text-foreground-tertiary">
                    <FaStar className="text-amber-400 mr-1" size={10} />
                    {competitor.rating || 'N/A'}
                    <span className="mx-1">·</span>
                    <FaComments className="text-neutral-400 mr-1" size={10} />
                    {competitor.reviews || 'N/A'}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
} 