import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaBuilding,
  FaStar,
  FaStarHalfAlt,
  FaPhone,
  FaMapMarkerAlt,
  FaGlobe,
  FaClock,
  FaCheckCircle,
  FaTimes,
  FaEdit,
  FaChartLine,
  FaCalendarAlt,
  FaHistory,
  FaUserFriends,
  FaLink
} from 'react-icons/fa';

export default function BusinessDetails({ business }) {
  const [isEditing, setIsEditing] = useState(false);
  
  if (!business) return null;

  // Convert the business hours to a more structured format
  const formatHours = (hours) => {
    if (!hours) return "No hours available";
    return hours.split(',').map(day => day.trim()).join(' • ');
  };

  // Generate star rating visuals based on the rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`star-${i}`} className="text-warning-500" />);
    }

    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half-star" className="text-warning-500" />);
    }

    // Add empty stars to make it always show 5 stars
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaStar key={`empty-star-${i}`} className="text-neutral-700" />);
    }

    return <div className="flex space-x-1">{stars}</div>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      {/* Header Card */}
      <div className="mb-6 p-6 glass-card rounded-xl border border-card-border shadow-float backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {/* Business Logo/Image */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 md:w-32 md:h-32 relative rounded-xl overflow-hidden bg-gradient-to-br from-primary-900/30 to-secondary-900/50 border border-neutral-800 shadow-float">
              {business.image ? (
                <img 
                  src={business.image} 
                  alt={business.name} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FaBuilding className="text-primary-500 text-4xl" />
                </div>
              )}
            </div>
          </div>
          
          {/* Business Main Info */}
          <div className="flex-grow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h1 className="text-3xl font-bold text-foreground">{business.name}</h1>
                <div className="text-sm text-foreground-tertiary">{business.category || 'No category available'}</div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(!isEditing)}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary-900/40 hover:bg-secondary-900/60 text-secondary-500 text-sm transition-colors"
              >
                <FaEdit size={12} />
                <span>Edit</span>
              </motion.button>
            </div>
            
            {/* Rating & Status Row */}
            <div className="flex flex-wrap gap-x-6 gap-y-3 mb-4">
              <div className="flex items-center">
                <div className="flex items-center">
                  {renderStars(business.rating || 0)}
                </div>
                <span className="ml-2 font-semibold text-foreground">
                  {business.rating || 0}
                </span>
                <span className="ml-1 text-sm text-foreground-tertiary">
                  ({business.reviewCount || 0} reviews)
                </span>
              </div>
              
              <div className="flex items-center">
                {business.isOpen ? (
                  <div className="px-2 py-1 rounded-md bg-success-900/20 border border-success-900/30">
                    <span className="text-success-500 text-sm font-medium">Currently Open</span>
                  </div>
                ) : (
                  <div className="px-2 py-1 rounded-md bg-danger-900/20 border border-danger-900/30">
                    <span className="text-danger-500 text-sm font-medium">Currently Closed</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Contact Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center mr-3">
                  <FaMapMarkerAlt className="text-primary-500" size={14} />
                </div>
                <div className="text-sm text-foreground-secondary">
                  {business.address || 'No address available'}
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center mr-3">
                  <FaPhone className="text-primary-500" size={14} />
                </div>
                <div className="text-sm text-foreground-secondary">
                  {business.phone || 'No phone available'}
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center mr-3">
                  <FaGlobe className="text-primary-500" size={14} />
                </div>
                <div className="text-sm text-foreground-secondary truncate max-w-xs">
                  {business.website ? (
                    <a 
                      href={business.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-info-500 hover:text-info-400 hover:underline transition-colors"
                    >
                      {business.website.replace(/^https?:\/\//i, '')}
                    </a>
                  ) : (
                    'No website available'
                  )}
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center mr-3">
                  <FaClock className="text-primary-500" size={14} />
                </div>
                <div className="text-sm text-foreground-secondary truncate max-w-xs">
                  {formatHours(business.hours)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Business Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <MetricCard 
          title="Rating Trend" 
          value={`${business.rating} / 5`} 
          trend={0.2}
          icon={<FaStar />}
          color="warning"
        />
        
        <MetricCard 
          title="Customer Engagement" 
          value={`${business.reviewCount || 0} reviews`} 
          trend={15}
          icon={<FaUserFriends />}
          color="info"
        />
        
        <MetricCard 
          title="Market Visibility" 
          value="72%" 
          trend={8}
          icon={<FaChartLine />}
          color="primary"
        />
      </div>
      
      {/* Business Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Business Description */}
        <div className="glass-card rounded-xl border border-card-border p-5 h-full">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
            <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center mr-3">
              <FaBuilding className="text-primary-500" size={14} />
            </div>
            About This Business
          </h3>
          
          <p className="text-foreground-secondary text-sm leading-relaxed mb-4">
            {business.description || 'No description available.'}
          </p>
          
          {/* Business Tags */}
          {business.categories && business.categories.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-foreground-tertiary mb-2">Business Categories</h4>
              <div className="flex flex-wrap gap-2">
                {business.categories.map((category, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center px-2.5 py-1 rounded-md bg-neutral-800 text-xs text-foreground-secondary"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Business Timeline */}
        <div className="glass-card rounded-xl border border-card-border p-5">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
            <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center mr-3">
              <FaHistory className="text-primary-500" size={14} />
            </div>
            Business Timeline
          </h3>
          
          <div className="space-y-4">
            <TimelineItem 
              title="Last Updated" 
              date="Today"
              icon={<FaEdit />}
              description="Profile information was updated"
            />
            
            <TimelineItem 
              title="Review Analysis" 
              date="2 days ago"
              icon={<FaChartLine />}
              description="Sentiment analysis of 56 new customer reviews"
            />
            
            <TimelineItem 
              title="Competitor Comparison" 
              date="1 week ago"
              icon={<FaBuilding />}
              description="Analysis against 12 local competitors completed"
            />
            
            <TimelineItem 
              title="Business Verified" 
              date="2 months ago"
              icon={<FaCheckCircle />}
              description="Business ownership verification completed"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center md:justify-end gap-3 p-5 glass-card rounded-xl border border-card-border">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="px-4 py-2 rounded-lg bg-info-600 hover:bg-info-500 text-white text-sm flex items-center shadow-md"
        >
          <FaLink className="mr-2" size={14} />
          View Google Page
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-sm flex items-center shadow-md"
        >
          <FaCalendarAlt className="mr-2" size={14} />
          Schedule Analysis
        </motion.button>
      </div>
    </motion.div>
  );
}

// Metric Card Component
function MetricCard({ title, value, icon, trend, color }) {
  const colors = {
    primary: {
      bg: "bg-primary-900/20",
      border: "border-primary-900/30",
      text: "text-primary-500",
      iconBg: "bg-primary-900/30"
    },
    warning: {
      bg: "bg-warning-900/20",
      border: "border-warning-900/30",
      text: "text-warning-500",
      iconBg: "bg-warning-900/30"
    },
    success: {
      bg: "bg-success-900/20",
      border: "border-success-900/30",
      text: "text-success-500",
      iconBg: "bg-success-900/30"
    },
    info: {
      bg: "bg-info-900/20",
      border: "border-info-900/30",
      text: "text-info-500",
      iconBg: "bg-info-900/30"
    }
  };
  
  const colorClass = colors[color] || colors.primary;
  
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className={`${colorClass.bg} ${colorClass.border} p-4 rounded-xl border shadow-sm`}
    >
      <div className="flex items-start">
        <div className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full ${colorClass.iconBg} ${colorClass.text} mr-3`}>
          {icon}
        </div>
        
        <div className="flex-grow">
          <div className="text-sm text-foreground-tertiary mb-1">{title}</div>
          <div className="font-bold text-xl text-foreground">{value}</div>
          
          {trend !== undefined && (
            <div className="flex items-center mt-1">
              <div className={`text-xs ${trend >= 0 ? 'text-success-500' : 'text-danger-500'} font-medium flex items-center`}>
                {trend >= 0 ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    +{trend}%
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    {trend}%
                  </>
                )}
                <span className="ml-1 text-foreground-tertiary">past 30 days</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Timeline Item Component
function TimelineItem({ title, date, icon, description }) {
  return (
    <div className="flex items-start">
      <div className="flex-shrink-0 w-10 flex flex-col items-center">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-800 text-primary-500">
          {icon}
        </div>
        {/* Line connecting to next item */}
        <div className="w-px h-full bg-neutral-800 my-1"></div>
      </div>
      
      <div className="ml-4 flex-grow pb-5">
        <div className="flex justify-between items-center mb-1">
          <h4 className="font-medium text-foreground">{title}</h4>
          <span className="text-xs text-foreground-tertiary">{date}</span>
        </div>
        <p className="text-sm text-foreground-secondary">{description}</p>
      </div>
    </div>
  );
} 