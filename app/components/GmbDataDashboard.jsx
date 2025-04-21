import { useState } from 'react';
import { 
  FaChartBar, 
  FaStar, 
  FaComments, 
  FaMapMarkerAlt, 
  FaExternalLinkAlt, 
  FaChevronDown, 
  FaChevronUp, 
  FaCamera,
  FaInfoCircle,
  FaDownload,
  FaClock,
  FaUserFriends,
  FaPhoneAlt,
  FaGlobe,
  FaTag,
  FaBuilding,
  FaSearch,
  FaHashtag,
  FaLink,
  FaLightbulb,
  FaCheck
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function GmbDataDashboard({ businessData, seoData }) {
  const [expandedSection, setExpandedSection] = useState('overview');
  const [activeGmbTab, setActiveGmbTab] = useState('overview');
  
  if (!businessData) return null;

  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  // Helper functions
  const formatPhoneNumber = (phone) => {
    return phone || 'Not available';
  };

  const getOpenStatus = () => {
    // This would typically come from the actual API data
    // For now, we're using a placeholder
    return businessData.openNow ? 'Open now' : 'Closed';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full glass-card p-6 rounded-2xl border border-card-border shadow-float backdrop-blur-sm"
    >
      {/* Header with business identity */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="flex-shrink-0 h-16 w-16 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-2xl font-bold mr-4">
            {businessData.name ? businessData.name.charAt(0) : 'B'}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{businessData.name}</h2>
            <div className="flex items-center mt-1 text-foreground-secondary">
              <FaTag className="mr-2 text-primary-500" size={14} />
              <span>{businessData.category || 'Business'}</span>
            </div>
            <div className="flex items-center mt-1 text-foreground-secondary">
              <FaMapMarkerAlt className="mr-2 text-primary-500" size={14} />
              <span>{businessData.location || (businessData.address ? businessData.address : 'Location unavailable')}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end mt-4 md:mt-0">
          <div className="bg-primary-900/20 p-3 rounded-lg flex items-center mb-2">
            <FaStar className="text-amber-500 mr-2" size={20} />
            <span className="text-xl font-bold">{businessData.rating}</span>
            <span className="text-foreground-secondary ml-2">({businessData.reviews} reviews)</span>
          </div>
          {businessData.website && (
            <a 
              href={businessData.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-500 hover:text-primary-600 flex items-center mt-2"
            >
              <FaExternalLinkAlt className="mr-1" size={12} />
              Visit website
            </a>
          )}
        </div>
      </div>
      
      {/* Key metrics overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard 
          title="Reviews" 
          value={businessData.reviews.toLocaleString()} 
          icon={<FaComments className="text-primary-500" size={20} />} 
          description="Total customer reviews"
        />
        
        <MetricCard 
          title="Rating" 
          value={`${businessData.rating}/5`} 
          icon={<FaStar className="text-amber-500" size={20} />} 
          description="Average customer rating"
        />
        
        <MetricCard 
          title="Phone" 
          value={formatPhoneNumber(businessData.phone)} 
          icon={<FaPhoneAlt className="text-green-500" size={20} />} 
          description="Contact number"
        />
        
        <MetricCard 
          title="Status" 
          value={getOpenStatus()} 
          icon={<FaClock className="text-blue-500" size={20} />} 
          description="Current open status"
        />
      </div>
      
      {/* Collapsible sections */}
      <div className="space-y-4">
        {/* Business Overview */}
        <DashboardSection
          title="Business Overview"
          icon={<FaInfoCircle />}
          color="info"
          isOpen={expandedSection === 'overview'}
          toggle={() => toggleSection('overview')}
        >
          <div className="glass-panel p-6 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-medium text-foreground mb-4 flex items-center">
                  <FaBuilding className="mr-2 text-info-500" size={16} />
                  Business Details
                </h4>
                <table className="w-full text-sm">
                  <tbody>
                    <tr>
                      <td className="py-2 pr-4 text-foreground-tertiary">Name:</td>
                      <td className="py-2 font-medium text-foreground">{businessData.name}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 text-foreground-tertiary">Category:</td>
                      <td className="py-2 text-foreground">{businessData.category || 'Not specified'}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 text-foreground-tertiary">Address:</td>
                      <td className="py-2 text-foreground">{businessData.address || 'Not available'}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 text-foreground-tertiary">Phone:</td>
                      <td className="py-2 text-foreground">{businessData.phone || 'Not available'}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 text-foreground-tertiary">Website:</td>
                      <td className="py-2 text-foreground">
                        {businessData.website ? (
                          <a 
                            href={businessData.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary-500 hover:text-primary-400 hover:underline flex items-center"
                          >
                            {businessData.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
                            <FaExternalLinkAlt size={10} className="ml-1" />
                          </a>
                        ) : (
                          'Not available'
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div>
                <h4 className="text-lg font-medium text-foreground mb-4 flex items-center">
                  <FaChartBar className="mr-2 text-info-500" size={16} />
                  Online Presence
                </h4>
                
                <div className="glass-panel p-4 rounded-xl mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-foreground-tertiary">Rating</span>
                    <span className="text-sm font-medium text-foreground">{businessData.rating}/5</span>
                  </div>
                  <div className="mb-4">
                    <div className="flex mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar 
                          key={star} 
                          className={star <= Math.round(businessData.rating) ? 'text-amber-400' : 'text-neutral-600'} 
                          size={20}
                        />
                      ))}
                    </div>
                    <div className="comparison-bar">
                      <div 
                        className="comparison-bar-fill bg-gradient-to-r from-amber-600 to-amber-400"
                        style={{ width: `${(businessData.rating / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-foreground-tertiary">Reviews</span>
                    <span className="text-sm font-medium text-foreground">{businessData.reviews?.toLocaleString() || 0}</span>
                  </div>
                  <div className="mb-2">
                    <div className="comparison-bar">
                      <div 
                        className="comparison-bar-fill bg-gradient-to-r from-primary-600 to-primary-400"
                        style={{ width: `${Math.min((businessData.reviews / 200) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-sm flex items-center shadow-md"
                    onClick={() => setActiveGmbTab('analytics')}
                  >
                    <FaChartBar className="mr-2" size={12} />
                    View Detailed Analytics
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </DashboardSection>
        
        {/* Customer Reviews Analysis */}
        <DashboardSection
          title="Review Metrics"
          icon={<FaUserFriends />}
          color="secondary"
          isOpen={expandedSection === 'reviews'}
          toggle={() => toggleSection('reviews')}
        >
          <div className="p-4 bg-background-secondary/50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-medium text-foreground mb-4">Rating Distribution</h4>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map(star => {
                    // Calculate mock distribution
                    let percentage;
                    if (star === 5) percentage = businessData.rating >= 4.5 ? 65 : 40;
                    else if (star === 4) percentage = businessData.rating >= 4 ? 25 : 30;
                    else if (star === 3) percentage = businessData.rating >= 3.5 ? 5 : 20;
                    else if (star === 2) percentage = businessData.rating >= 3 ? 3 : 7;
                    else percentage = businessData.rating >= 2.5 ? 2 : 3;
                    
                    return (
                      <div key={star} className="flex items-center">
                        <div className="flex items-center w-20">
                          <span className="text-foreground-secondary mr-1">{star}</span>
                          <FaStar className="text-amber-400" size={14} />
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3 mx-3">
                          <div 
                            className="bg-amber-400 rounded-full h-3" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-foreground-secondary text-sm">{percentage}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-medium text-foreground mb-4">Review Metrics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-neutral-800 rounded-lg shadow-sm">
                    <div className="text-3xl font-bold text-foreground mb-1">{businessData.reviews}</div>
                    <div className="text-sm text-foreground-tertiary">Total Reviews</div>
                  </div>
                  
                  <div className="p-4 bg-neutral-800 rounded-lg shadow-sm">
                    <div className="text-3xl font-bold text-amber-500 mb-1">{businessData.rating}</div>
                    <div className="text-sm text-foreground-tertiary">Average Rating</div>
                  </div>
                  
                  <div className="p-4 bg-neutral-800 rounded-lg shadow-sm">
                    <div className="text-3xl font-bold text-blue-500 mb-1">
                      {businessData.rating >= 4.5 ? 'High' : businessData.rating >= 4.0 ? 'Good' : 'Average'}
                    </div>
                    <div className="text-sm text-foreground-tertiary">Sentiment</div>
                  </div>
                  
                  <div className="p-4 bg-neutral-800 rounded-lg shadow-sm">
                    <div className="text-3xl font-bold text-green-500 mb-1">
                      {businessData.reviews > 100 ? 'Active' : 'Growing'}
                    </div>
                    <div className="text-sm text-foreground-tertiary">Profile Status</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DashboardSection>
        
        {/* Maps & Location */}
        <DashboardSection
          title="Maps & Location"
          icon={<FaMapMarkerAlt />}
          color="accent"
          isOpen={expandedSection === 'location'}
          toggle={() => toggleSection('location')}
        >
          <div className="p-4 bg-background-secondary/50 rounded-lg">
            <div className="overflow-hidden rounded-lg border border-neutral-800 h-64 bg-neutral-800 flex items-center justify-center">
              <div className="text-center p-6">
                <FaMapMarkerAlt className="text-5xl text-primary-500 mx-auto mb-4" />
                <p className="text-foreground-secondary mb-2">Map visualization would be displayed here</p>
                <p className="text-sm text-foreground-tertiary">{businessData.address}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <InfoBox 
                title="Business Area" 
                value={businessData.location || 'Not available'} 
                icon={<FaMapMarkerAlt className="text-primary-500" />}
              />
              
              <InfoBox 
                title="Operating Hours" 
                value="Mon-Fri: 9AM-5PM" 
                icon={<FaClock className="text-blue-500" />}
              />
              
              <InfoBox 
                title="Service Area" 
                value={`${businessData.location} and surrounding areas`} 
                icon={<FaGlobe className="text-green-500" />}
              />
            </div>
          </div>
        </DashboardSection>
      </div>
    </motion.div>
  );
}

function MetricCard({ title, value, icon, color = "primary", description }) {
  const colorMap = {
    primary: "from-primary-900/20 to-primary-900/5 text-primary-500",
    secondary: "from-secondary-900/20 to-secondary-900/5 text-secondary-500",
    success: "from-success-900/20 to-success-900/5 text-success-500",
    info: "from-info-900/20 to-info-900/5 text-info-500",
  };
  
  const colorClass = colorMap[color] || colorMap.primary;
  
  return (
    <div className={`p-4 rounded-xl bg-gradient-to-br ${colorClass} border border-neutral-800 hover:shadow-md transition-shadow`}>
      <div className="flex items-center mb-3">
        <div className="mr-3 opacity-70">
          {icon}
        </div>
        <h5 className="text-sm font-medium text-foreground">{title}</h5>
      </div>
      <div className="text-2xl font-bold text-foreground mb-1">{value}</div>
      {description && (
        <p className="text-xs text-foreground-tertiary">{description}</p>
      )}
    </div>
  );
}

function DashboardSection({ title, icon, color = "primary", isOpen, toggle, children }) {
  // Color maps for different section types
  const colorMap = {
    primary: {
      bg: "bg-primary-900/30",
      text: "text-primary-500",
      hover: "hover:bg-primary-900/40",
      gradient: "from-primary-900/20 to-primary-900/5"
    },
    secondary: {
      bg: "bg-secondary-900/30",
      text: "text-secondary-500",
      hover: "hover:bg-secondary-900/40",
      gradient: "from-secondary-900/20 to-secondary-900/5"
    },
    success: {
      bg: "bg-success-900/30",
      text: "text-success-500",
      hover: "hover:bg-success-900/40",
      gradient: "from-success-900/20 to-success-900/5"
    },
    info: {
      bg: "bg-info-900/30",
      text: "text-info-500",
      hover: "hover:bg-info-900/40",
      gradient: "from-info-900/20 to-info-900/5"
    }
  };
  
  const colorClass = colorMap[color] || colorMap.primary;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-neutral-800 rounded-xl overflow-hidden backdrop-blur-sm shadow-md"
    >
      <motion.button
        className={`w-full py-4 px-5 flex items-center justify-between ${colorClass.hover} transition-colors focus:outline-none`}
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
        onClick={toggle}
      >
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${colorClass.bg} ${colorClass.text} mr-3 shadow-inner`}>
            {icon}
          </div>
          <h3 className="font-semibold text-foreground text-lg">{title}</h3>
        </div>
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${isOpen ? colorClass.bg : 'bg-neutral-800'} transition-colors`}>
          {isOpen ? (
            <FaChevronUp className={isOpen ? colorClass.text : "text-foreground-tertiary"} size={14} />
          ) : (
            <FaChevronDown className="text-foreground-tertiary" size={14} />
          )}
        </div>
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className={`p-5 border-t border-neutral-800 bg-gradient-to-b ${colorClass.gradient}`}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function InfoBox({ title, value, icon }) {
  return (
    <div className="p-4 bg-neutral-800 rounded-lg shadow-sm">
      <div className="flex items-center mb-2">
        <div className="w-8 h-8 rounded-full bg-primary-900/20 flex items-center justify-center mr-2">
          {icon}
        </div>
        <h4 className="text-sm font-medium text-foreground-secondary">{title}</h4>
      </div>
      <p className="text-foreground">{value}</p>
    </div>
  );
}

// Custom SEO Tip component
const SeoTip = ({ title, description }) => {
  return (
    <li className="flex items-start p-2 rounded-lg hover:bg-secondary-900/20 transition-colors">
      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-secondary-900/30 flex items-center justify-center mt-0.5 mr-2">
        <FaCheck className="text-secondary-500" size={10} />
      </div>
      <div>
        <h6 className="text-sm font-medium text-foreground">{title}</h6>
        <p className="text-xs text-foreground-tertiary">{description}</p>
      </div>
    </li>
  );
}; 