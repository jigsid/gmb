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
  FaTag
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function GmbDataDashboard({ businessData, seoData }) {
  const [expandedSection, setExpandedSection] = useState('overview');
  
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
          color="primary"
          isOpen={expandedSection === 'overview'}
          toggle={() => toggleSection('overview')}
        >
          <div className="p-4 bg-background-secondary/50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-medium text-foreground mb-4">Details</h4>
                <table className="w-full text-sm">
                  <tbody>
                    <tr>
                      <td className="py-2 pr-4 text-foreground-tertiary">Name:</td>
                      <td className="py-2 font-medium">{businessData.name}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 text-foreground-tertiary">Category:</td>
                      <td className="py-2">{businessData.category || 'Not specified'}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 text-foreground-tertiary">Address:</td>
                      <td className="py-2">{businessData.address || 'Not available'}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 text-foreground-tertiary">Phone:</td>
                      <td className="py-2">{businessData.phone || 'Not available'}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 text-foreground-tertiary">Website:</td>
                      <td className="py-2">
                        {businessData.website ? (
                          <a href={businessData.website} target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline flex items-center">
                            {businessData.website.replace(/^https?:\/\/(www\.)?/, '')}
                            <FaExternalLinkAlt className="ml-1" size={10} />
                          </a>
                        ) : 'Not available'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div>
                <h4 className="text-lg font-medium text-foreground mb-4">Online Presence</h4>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-700 rounded-full h-4 mr-4">
                      <div 
                        className="h-full bg-primary-500 rounded-full" 
                        style={{ width: `${(businessData.rating / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-foreground-secondary text-sm font-medium">{businessData.rating}/5</span>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-full bg-gray-700 rounded-full h-4 mr-4">
                      <div 
                        className="h-full bg-secondary-500 rounded-full" 
                        style={{ width: `${Math.min((businessData.reviews / 100), 100)}%` }}
                      />
                    </div>
                    <span className="text-foreground-secondary text-sm font-medium">{businessData.reviews.toLocaleString()}</span>
                  </div>
                  
                  {seoData && (
                    <div className="flex items-center">
                      <div className="w-full bg-gray-700 rounded-full h-4 mr-4">
                        <div 
                          className="h-full bg-green-500 rounded-full" 
                          style={{ width: `${seoData.domainAuthority}%` }}
                        />
                      </div>
                      <span className="text-foreground-secondary text-sm font-medium">Domain Authority</span>
                    </div>
                  )}
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

function MetricCard({ title, value, icon, description }) {
  return (
    <div className="bg-neutral-800 p-4 rounded-lg shadow-sm flex items-start">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-900/30 flex items-center justify-center mr-3">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-bold text-foreground">{value}</h3>
        <div className="flex flex-col">
          <span className="text-xs font-medium text-foreground-secondary">{title}</span>
          <span className="text-xs text-foreground-tertiary">{description}</span>
        </div>
      </div>
    </div>
  );
}

function DashboardSection({ title, icon, color = "primary", isOpen, toggle, children }) {
  const colorClasses = {
    primary: "from-primary-500 to-primary-600 text-white",
    secondary: "from-secondary-500 to-secondary-600 text-white",
    accent: "from-blue-500 to-indigo-600 text-white",
    neutral: "from-neutral-500 to-neutral-600 text-white"
  };
  
  return (
    <div className="border border-neutral-800 rounded-xl overflow-hidden">
      <motion.div 
        onClick={toggle}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={`flex justify-between items-center cursor-pointer bg-gradient-to-r ${colorClasses[color]} p-4`}
      >
        <h3 className="text-lg font-semibold flex items-center">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3">
            {icon}
          </div>
          {title}
        </h3>
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          {isOpen ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
        </div>
      </motion.div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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