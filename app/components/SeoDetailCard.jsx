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
import { motion, AnimatePresence } from 'framer-motion';

export default function SeoDetailCard({ seoData, businessName }) {
  const [expanded, setExpanded] = useState(false);
  
  if (!seoData) return null;

  // Calculate authority score description
  let authorityDescription = "Low";
  let authorityColor = "text-orange-500";
  if (seoData.domainAuthority >= 70) {
    authorityDescription = "Excellent";
    authorityColor = "text-primary-500";
  } else if (seoData.domainAuthority >= 50) {
    authorityDescription = "Strong";
    authorityColor = "text-green-500";
  } else if (seoData.domainAuthority >= 30) {
    authorityDescription = "Moderate";
    authorityColor = "text-yellow-500";
  }
  
  // Calculate traffic score description
  let trafficDescription = "Low";
  let trafficColor = "text-orange-500";
  if (seoData.monthlyTraffic >= 50000) {
    trafficDescription = "High";
    trafficColor = "text-primary-500";
  } else if (seoData.monthlyTraffic >= 10000) {
    trafficDescription = "Moderate";
    trafficColor = "text-green-500";
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full glass-card p-6 rounded-2xl border border-card-border shadow-float mt-8"
    >
      <motion.div 
        className="flex justify-between items-center cursor-pointer" 
        onClick={() => setExpanded(!expanded)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <h2 className="text-xl font-bold text-foreground flex items-center">
          <div className="flex items-center justify-center w-10 h-10 mr-3 rounded-full bg-secondary-50 dark:bg-secondary-900/30">
            <FaGlobe className="text-secondary-500" />
          </div>
          Website SEO Potential
          {seoData.isEstimated && (
            <span className="ml-2 text-sm font-normal text-foreground-tertiary">
              (Estimated)
            </span>
          )}
        </h2>
        <motion.button 
          className="flex items-center justify-center w-8 h-8 rounded-full bg-background-secondary text-foreground-secondary hover:bg-secondary-50 dark:hover:bg-secondary-900/30 hover:text-secondary-500 transition-colors"
          whileHover={{ rotate: expanded ? -180 : 180, scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {expanded ? <FaChevronUp /> : <FaChevronDown />}
        </motion.button>
      </motion.div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6 p-5 bg-secondary-50/50 dark:bg-secondary-900/10 backdrop-blur-sm rounded-xl border border-secondary-100 dark:border-secondary-800 mb-6"
            >
              <p className="text-foreground-secondary">
                <span className="font-semibold">{businessName || 'This business'}</span>'s website 
                has a <span className={`font-semibold ${authorityColor}`}>Domain Authority of {seoData.domainAuthority}</span>, 
                which is considered <span className={`font-semibold ${authorityColor}`}>{authorityDescription}</span> in 
                the website authority scale. With appropriate SEO strategies, the site could significantly improve from its current
                <span className={`font-semibold ${trafficColor}`}> {formatTraffic(seoData.monthlyTraffic)} monthly visits</span>.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <DetailMetricCard
                title="Domain Authority"
                value={seoData.domainAuthority}
                maxValue={100}
                icon={<FaGlobe />}
                color="secondary"
                description="Authority score out of 100"
                tooltip="Higher scores indicate stronger website authority and potential to rank well in search engines"
                delay={0.15}
              />
              
              <DetailMetricCard
                title="Page Authority"
                value={seoData.pageAuthority}
                maxValue={100}
                icon={<FaLink />}
                color="primary" 
                description="Page score out of 100"
                tooltip="Indicates the strength of individual pages on the website"
                delay={0.2}
              />
              
              <DetailMetricCard
                title="Monthly Traffic"
                value={seoData.monthlyTraffic}
                displayValue={formatTraffic(seoData.monthlyTraffic)}
                maxValue={100000}
                icon={<FaChartLine />}
                color="accent"
                description={trafficDescription + " traffic potential"}
                tooltip="Estimated monthly visitors to the website - can be increased with proper SEO strategy"
                delay={0.25}
              />
              
              <DetailMetricCard
                title="Backlinks"
                value={seoData.backlinks}
                displayValue={formatNumber(seoData.backlinks)}
                maxValue={10000}
                icon={<FaLink />}
                color="amber"
                description="Incoming links"
                tooltip="The number of external websites linking to this site"
                delay={0.3}
              />
              
              <DetailMetricCard
                title="Ranking Keywords"
                value={seoData.rankingKeywords}
                displayValue={formatNumber(seoData.rankingKeywords)}
                maxValue={5000}
                icon={<FaSearch />}
                color="indigo"
                description="SEO keywords"
                tooltip="The number of keywords this website ranks for in search engines"
                delay={0.35}
              />
              
              <DetailMetricCard
                title="Spam Score"
                value={seoData.spamScore}
                displayValue={seoData.spamScore + "/10"}
                maxValue={10}
                icon={<FaShieldAlt />}
                color="red"
                isInverted={true}
                description={seoData.spamScore <= 3 ? "Low risk" : seoData.spamScore <= 7 ? "Medium risk" : "High risk"}
                tooltip="Indicates the likelihood that search engines will flag this site as spam (lower is better)"
                delay={0.4}
              />
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="mt-6 flex flex-col md:flex-row md:justify-between items-start md:items-center text-sm text-foreground-tertiary"
            >
              <div className="flex items-center mb-3 md:mb-0">
                <div className="flex items-center justify-center w-6 h-6 mr-2 rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <FaInfoCircle className="text-neutral-500" size={12} />
                </div>
                <span>Domain: {seoData.domain}</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <motion.a
                  href={`https://www.google.com/search?q=site:${seoData.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-1.5 px-3 rounded-full text-xs flex items-center bg-neutral-100 hover:bg-secondary-50 dark:bg-neutral-800 dark:hover:bg-secondary-900/30 text-foreground-secondary hover:text-secondary-500 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaSearch className="mr-1.5" size={10} />
                  Google Index
                </motion.a>
                
                <motion.a
                  href={`https://${seoData.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-1.5 px-3 rounded-full text-xs flex items-center bg-neutral-100 hover:bg-primary-50 dark:bg-neutral-800 dark:hover:bg-primary-900/30 text-foreground-secondary hover:text-primary-500 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaExternalLinkAlt className="mr-1.5" size={10} />
                  Visit Website
                </motion.a>
              </div>
            </motion.div>
            
            {seoData.dataSource === 'fallback' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-4 text-xs text-foreground-tertiary/80 italic"
              >
                * These metrics are estimated using our proprietary algorithm as exact data from premium SEO tools is unavailable.
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function DetailMetricCard({ 
  title, 
  value, 
  displayValue, 
  maxValue, 
  icon, 
  color = "primary", 
  description, 
  tooltip,
  isInverted = false,
  delay = 0
}) {
  // Color mapping based on the color prop
  const colorMap = {
    primary: {
      bg: "bg-primary-50 dark:bg-primary-900/30",
      text: "text-primary-500",
      border: "border-primary-100 dark:border-primary-800",
      fill: "from-primary-100 to-primary-300 dark:from-primary-900/50 dark:to-primary-700/50"
    },
    secondary: {
      bg: "bg-secondary-50 dark:bg-secondary-900/30",
      text: "text-secondary-500",
      border: "border-secondary-100 dark:border-secondary-800",
      fill: "from-secondary-100 to-secondary-300 dark:from-secondary-900/50 dark:to-secondary-700/50"
    },
    accent: {
      bg: "bg-accent-50 dark:bg-accent-900/30",
      text: "text-accent-500",
      border: "border-accent-100 dark:border-accent-800",
      fill: "from-accent-100 to-accent-300 dark:from-accent-900/50 dark:to-accent-700/50"
    },
    amber: {
      bg: "bg-amber-50 dark:bg-amber-900/30",
      text: "text-amber-500",
      border: "border-amber-100 dark:border-amber-800",
      fill: "from-amber-100 to-amber-300 dark:from-amber-900/50 dark:to-amber-700/50"
    },
    indigo: {
      bg: "bg-indigo-50 dark:bg-indigo-900/30",
      text: "text-indigo-500",
      border: "border-indigo-100 dark:border-indigo-800",
      fill: "from-indigo-100 to-indigo-300 dark:from-indigo-900/50 dark:to-indigo-700/50"
    },
    red: {
      bg: "bg-red-50 dark:bg-red-900/30",
      text: "text-red-500",
      border: "border-red-100 dark:border-red-800",
      fill: "from-red-100 to-red-300 dark:from-red-900/50 dark:to-red-700/50"
    }
  };
  
  const colorClass = colorMap[color] || colorMap.primary;
  
  // Calculate percentage for the progress meter
  const percentage = Math.min(Math.max((value / maxValue) * 100, 0), 100);
  const displayPercentage = isInverted ? 100 - percentage : percentage;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-background-secondary/50 backdrop-blur-sm p-5 rounded-xl border border-card-border hover:shadow-lg transition-shadow" 
      title={tooltip}
      whileHover={{ y: -3 }}
    >
      <div className="flex items-center mb-2">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${colorClass.bg}`}>
          <span className={colorClass.text}>{icon}</span>
        </div>
        <h3 className="ml-2 text-md font-medium text-foreground">{title}</h3>
      </div>
      
      <div className="mt-3 mb-2">
        <p className="text-2xl font-bold text-foreground">{displayValue || value}</p>
        <div className="relative h-2 mt-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${displayPercentage}%` }}
            transition={{ duration: 1, delay: delay + 0.1, ease: "easeOut" }}
            className={`absolute h-full rounded-full bg-gradient-to-r ${colorClass.fill}`}
          />
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <p className="text-xs text-foreground-tertiary">{description}</p>
        <span className="text-xs font-medium text-foreground-secondary">{Math.round(displayPercentage)}%</span>
      </div>
    </motion.div>
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