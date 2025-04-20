import { useState } from 'react';
import { 
  FaGlobe, 
  FaChartLine, 
  FaLink, 
  FaSearch, 
  FaShieldAlt, 
  FaInfoCircle,
  FaExternalLinkAlt,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';

export default function SeoDetailCard({ seoData, businessName }) {
  const [expanded, setExpanded] = useState(false);
  
  if (!seoData) return null;

  // Calculate authority score description
  let authorityDescription = "Low";
  if (seoData.domainAuthority >= 70) authorityDescription = "Excellent";
  else if (seoData.domainAuthority >= 50) authorityDescription = "Strong";
  else if (seoData.domainAuthority >= 30) authorityDescription = "Moderate";
  
  // Calculate traffic score description
  let trafficDescription = "Low";
  if (seoData.monthlyTraffic >= 50000) trafficDescription = "High";
  else if (seoData.monthlyTraffic >= 10000) trafficDescription = "Moderate";
  
  return (
    <div className="w-full bg-white p-6 rounded-xl shadow-md mt-8">
      <div 
        className="flex justify-between items-center cursor-pointer" 
        onClick={() => setExpanded(!expanded)}
      >
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <FaGlobe className="mr-2 text-purple-500" />
          Website SEO Analysis
          {seoData.isEstimated && (
            <span className="ml-2 text-sm font-normal text-gray-500 italic">
              (Estimated)
            </span>
          )}
        </h2>
        <button className="text-gray-500 hover:text-gray-700">
          {expanded ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>
      
      {expanded && (
        <div className="mt-4">
          <div className="p-4 bg-purple-50 rounded-lg mb-6">
            <p className="text-gray-700">
              <span className="font-semibold">{businessName || 'This business'}</span>'s website 
              has a <span className="font-semibold text-purple-700">Domain Authority of {seoData.domainAuthority}</span>, 
              which is considered <span className="font-semibold">{authorityDescription}</span> in 
              the website authority scale. The site receives approximately 
              <span className="font-semibold text-green-700"> {formatTraffic(seoData.monthlyTraffic)} monthly visits</span>.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <DetailMetricCard
              title="Domain Authority"
              value={seoData.domainAuthority}
              icon={<FaGlobe className="text-purple-500" size={20} />}
              description="Authority score out of 100"
              tooltip="Higher scores indicate stronger website authority and potential to rank well in search engines"
            />
            
            <DetailMetricCard
              title="Page Authority"
              value={seoData.pageAuthority}
              icon={<FaLink className="text-blue-500" size={20} />}
              description="Page score out of 100"
              tooltip="Indicates the strength of individual pages on the website"
            />
            
            <DetailMetricCard
              title="Monthly Traffic"
              value={formatTraffic(seoData.monthlyTraffic)}
              icon={<FaChartLine className="text-green-500" size={20} />}
              description={trafficDescription + " traffic"}
              tooltip="Estimated monthly visitors to the website"
            />
            
            <DetailMetricCard
              title="Backlinks"
              value={formatNumber(seoData.backlinks)}
              icon={<FaLink className="text-orange-500" size={20} />}
              description="Incoming links"
              tooltip="The number of external websites linking to this site"
            />
            
            <DetailMetricCard
              title="Ranking Keywords"
              value={formatNumber(seoData.rankingKeywords)}
              icon={<FaSearch className="text-indigo-500" size={20} />}
              description="SEO keywords"
              tooltip="The number of keywords this website ranks for in search engines"
            />
            
            <DetailMetricCard
              title="Spam Score"
              value={seoData.spamScore + "/10"}
              icon={<FaShieldAlt className="text-red-500" size={20} />}
              description={seoData.spamScore <= 3 ? "Low risk" : seoData.spamScore <= 7 ? "Medium risk" : "High risk"}
              tooltip="Indicates the likelihood that search engines will flag this site as spam (lower is better)"
            />
          </div>
          
          <div className="mt-6 flex flex-col md:flex-row md:justify-between items-start md:items-center text-sm text-gray-600">
            <div className="flex items-center mb-2 md:mb-0">
              <FaInfoCircle className="mr-1 text-gray-500" />
              <span>Domain: {seoData.domain}</span>
            </div>
            
            <div className="flex items-center">
              <a
                href={`https://www.google.com/search?q=site:${seoData.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-secondary flex items-center mr-4"
              >
                <FaSearch className="mr-1" size={12} />
                Google Index
              </a>
              
              <a
                href={`https://${seoData.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-secondary flex items-center"
              >
                <FaExternalLinkAlt className="mr-1" size={12} />
                Visit Website
              </a>
            </div>
          </div>
          
          {seoData.dataSource === 'fallback' && (
            <div className="mt-4 text-xs text-gray-500 italic">
              * These metrics are estimated using our proprietary algorithm as exact data from paid tools is unavailable.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DetailMetricCard({ title, value, icon, description, tooltip }) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg" title={tooltip}>
      <div className="flex items-center mb-1">
        {icon}
        <h3 className="ml-2 text-md font-medium text-gray-700">{title}</h3>
      </div>
      <p className="text-xl font-bold text-gray-800">{value}</p>
      <p className="text-xs text-gray-500">{description}</p>
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

function formatNumber(num) {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString();
} 