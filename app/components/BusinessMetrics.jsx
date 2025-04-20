import { FaStar, FaComments, FaLink, FaChartLine, FaExternalLinkAlt, FaMapMarkerAlt, FaTag, FaGlobe, FaSearch } from 'react-icons/fa';

export default function BusinessMetrics({ businessData, seoData }) {
  if (!businessData) return null;

  return (
    <div className="w-full bg-white p-6 rounded-xl shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{businessData.name}</h2>
          <div className="flex items-center text-gray-600 mt-1">
            <FaTag className="mr-1 text-gray-500" size={14} />
            <span>{businessData.category || 'Business'}</span>
          </div>
          <div className="flex items-center text-gray-600 mt-1">
            <FaMapMarkerAlt className="mr-1 text-gray-500" size={14} />
            <span>{businessData.location || (businessData.address ? businessData.address.split(',')[0] : 'Location unavailable')}</span>
          </div>
          
          {businessData.website && (
            <a 
              href={businessData.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:text-secondary flex items-center mt-2"
            >
              <FaExternalLinkAlt className="mr-1" size={14} />
              {businessData.website.replace(/^https?:\/\/(www\.)?/, '')}
            </a>
          )}
        </div>
        
        <div className="flex items-center mt-4 md:mt-0">
          <div className="bg-yellow-100 p-3 rounded-lg flex items-center">
            <FaStar className="text-yellow-500 mr-2" size={20} />
            <span className="text-xl font-bold">{businessData.rating}</span>
            <span className="text-gray-600 ml-2">({businessData.reviews} reviews)</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard 
          title="Reviews" 
          value={businessData.reviews.toLocaleString()} 
          icon={<FaComments className="text-blue-500" size={24} />} 
          description="Total customer reviews"
        />
        
        <MetricCard 
          title="Location" 
          value={businessData.location || 'N/A'} 
          icon={<FaMapMarkerAlt className="text-red-500" size={24} />} 
          description="Business area"
        />
        
        <MetricCard 
          title="Category" 
          value={businessData.category || 'Business'} 
          icon={<FaTag className="text-green-500" size={24} />} 
          description="Business type"
        />
        
        {seoData && (
          <>
            <MetricCard 
              title="Domain Authority" 
              value={seoData.domainAuthority} 
              icon={<FaGlobe className="text-purple-500" size={24} />} 
              description={seoData.dataSource === 'fallback' ? 'Estimated score' : 'Web authority score'}
              tooltip="Domain authority is a 0-100 score that indicates how well a website might rank on search engines"
            />
            
            <MetricCard 
              title="Monthly Traffic" 
              value={formatTraffic(seoData.monthlyTraffic)} 
              icon={<FaChartLine className="text-green-500" size={24} />} 
              description={seoData.dataSource === 'fallback' ? 'Estimated visitors' : 'Estimated monthly visitors'}
              tooltip="Estimated number of visitors to the website per month"
            />
            
            <MetricCard 
              title="Ranking Keywords" 
              value={seoData.rankingKeywords.toLocaleString()} 
              icon={<FaSearch className="text-orange-500" size={24} />} 
              description={seoData.dataSource === 'fallback' ? 'Estimated count' : 'Estimated keywords'}
              tooltip="Number of keywords the website ranks for in search engines"
            />
          </>
        )}
      </div>

      {seoData && seoData.isEstimated && (
        <div className="mt-4 text-xs text-gray-500 italic text-center">
          * SEO metrics are estimated using our proprietary algorithm when exact data is unavailable.
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, icon, description, tooltip }) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg" title={tooltip}>
      <div className="flex items-center mb-2">
        {icon}
        <h3 className="ml-2 text-lg font-semibold text-gray-700">{title}</h3>
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}

function formatTraffic(traffic) {
  if (traffic >= 1000000) {
    return `${(traffic / 1000000).toFixed(1)}M`;
  } else if (traffic >= 1000) {
    return `${(traffic / 1000).toFixed(1)}K`;
  }
  return traffic.toLocaleString();
} 