import { useState } from 'react';
import { 
  FaBrain, 
  FaChevronDown, 
  FaChevronUp, 
  FaThumbsUp, 
  FaThumbsDown, 
  FaLightbulb, 
  FaExclamationTriangle, 
  FaChartLine, 
  FaRobot,
  FaCheckCircle,
  FaPlus,
  FaMinus,
  FaBolt,
  FaTrophy,
  FaCrown,
  FaRegClock
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function AiInsights({ insights }) {
  const [expandedSection, setExpandedSection] = useState('summary');
  const [feedbackGiven, setFeedbackGiven] = useState(null);

  if (!insights) return null;

  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  const giveFeedback = (isPositive) => {
    setFeedbackGiven(isPositive);
    // Here you could send feedback to your backend
  };

  // Calculate some mock metrics for the executive summary
  const positiveMetrics = {
    growthOpportunity: Math.floor(Math.random() * 30) + 70,
    competitivePosition: Math.floor(Math.random() * 40) + 60,
    marketExpansion: Math.floor(Math.random() * 30) + 60,
    timeToImplement: Math.floor(Math.random() * 6) + 2
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      {/* Executive Summary */}
      <div className="mb-6 p-6 glass-card rounded-xl border border-card-border shadow-float backdrop-blur-sm">
        <div className="flex items-center mb-5">
          <div className="relative mr-4">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-400/30 to-secondary-500/30 rounded-full animate-pulse-slow" />
            <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 shadow-lg">
              <FaRobot className="text-white" size={24} />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-1">Executive Growth Summary</h2>
            <p className="text-sm text-foreground-tertiary">Enterprise-grade AI analysis based on market data</p>
          </div>
          
          <div className="ml-auto flex items-center">
            <div className="hidden md:block px-3 py-1.5 rounded-lg bg-success-900/30 border border-success-900/30 text-success-500 text-sm">
              <span className="font-medium">Growth Score: {positiveMetrics.growthOpportunity}%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
          <div className="glass-panel p-4 rounded-xl border border-neutral-800">
            <div className="flex justify-between items-center mb-2">
              <div className="text-xs text-foreground-tertiary">Growth Opportunity</div>
              <div className="w-9 h-9 rounded-full bg-primary-900/30 flex items-center justify-center">
                <FaBolt className="text-primary-500" size={16} />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground">{positiveMetrics.growthOpportunity}%</div>
            <div className="text-xs text-foreground-tertiary mt-1">Potential for business expansion</div>
            <div className="mt-2 comparison-bar">
              <div className="comparison-bar-fill bg-gradient-to-r from-primary-600 to-primary-400" style={{ width: `${positiveMetrics.growthOpportunity}%` }} />
            </div>
          </div>
          
          <div className="glass-panel p-4 rounded-xl border border-neutral-800">
            <div className="flex justify-between items-center mb-2">
              <div className="text-xs text-foreground-tertiary">Competitive Position</div>
              <div className="w-9 h-9 rounded-full bg-warning-900/30 flex items-center justify-center">
                <FaTrophy className="text-warning-500" size={16} />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground">{positiveMetrics.competitivePosition}%</div>
            <div className="text-xs text-foreground-tertiary mt-1">Relative to top competitors</div>
            <div className="mt-2 comparison-bar">
              <div className="comparison-bar-fill bg-gradient-to-r from-warning-600 to-warning-400" style={{ width: `${positiveMetrics.competitivePosition}%` }} />
            </div>
          </div>
          
          <div className="glass-panel p-4 rounded-xl border border-neutral-800">
            <div className="flex justify-between items-center mb-2">
              <div className="text-xs text-foreground-tertiary">Market Reach</div>
              <div className="w-9 h-9 rounded-full bg-secondary-900/30 flex items-center justify-center">
                <FaCrown className="text-secondary-500" size={16} />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground">{positiveMetrics.marketExpansion}%</div>
            <div className="text-xs text-foreground-tertiary mt-1">Potential to expand market share</div>
            <div className="mt-2 comparison-bar">
              <div className="comparison-bar-fill bg-gradient-to-r from-secondary-600 to-secondary-400" style={{ width: `${positiveMetrics.marketExpansion}%` }} />
            </div>
          </div>
          
          <div className="glass-panel p-4 rounded-xl border border-neutral-800">
            <div className="flex justify-between items-center mb-2">
              <div className="text-xs text-foreground-tertiary">Implementation Time</div>
              <div className="w-9 h-9 rounded-full bg-info-900/30 flex items-center justify-center">
                <FaRegClock className="text-info-500" size={16} />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground">{positiveMetrics.timeToImplement} weeks</div>
            <div className="text-xs text-foreground-tertiary mt-1">Estimated time to execute plan</div>
            <div className="mt-2 comparison-bar">
              <div className="comparison-bar-fill bg-gradient-to-r from-info-600 to-info-400" style={{ width: `${100 - (positiveMetrics.timeToImplement * 10)}%` }} />
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 bg-gradient-to-br from-primary-900/20 to-secondary-900/20 backdrop-blur-sm rounded-xl border border-primary-900/30 shadow-inner"
        >
          <p className="text-foreground-secondary leading-relaxed">{insights.summary}</p>
        </motion.div>
      </div>

      {/* Accordion Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Strengths Section */}
          <AccordionSection 
            title="Your Business Strengths"
            icon={<FaCheckCircle />}
            color="success"
            isOpen={expandedSection === 'strengths'}
            toggle={() => toggleSection('strengths')}
            delay={0.15}
          >
            <div className="space-y-3 p-1">
              {insights.strengths.map((strength, index) => (
                <motion.div 
                  key={index}
                  className="flex items-start group p-3 bg-success-900/10 rounded-lg border border-success-900/20 hover:bg-success-900/15 transition-colors"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + (index * 0.05) }}
                >
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-success-900/30 text-success-500 mt-0.5 mr-3 group-hover:scale-110 transition-transform">
                    <FaPlus size={12} />
                  </div>
                  <p className="text-foreground-secondary">{strength}</p>
                </motion.div>
              ))}
            </div>
          </AccordionSection>

          {/* Weaknesses Section */}
          <AccordionSection 
            title="Areas for Improvement"
            icon={<FaExclamationTriangle />}
            color="warning"
            isOpen={expandedSection === 'weaknesses'}
            toggle={() => toggleSection('weaknesses')}
            delay={0.2}
          >
            <div className="space-y-3 p-1">
              {insights.weaknesses.map((weakness, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + (index * 0.05) }}
                  className="flex items-start group p-3 bg-warning-900/10 rounded-lg border border-warning-900/20 hover:bg-warning-900/15 transition-colors"
                >
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-warning-900/30 text-warning-500 mt-0.5 mr-3 group-hover:scale-110 transition-transform">
                    <FaMinus size={12} />
                  </div>
                  <span className="text-foreground-secondary">{weakness}</span>
                </motion.div>
              ))}
            </div>
          </AccordionSection>

          {/* Recommendations Section */}
          <AccordionSection 
            title="Growth Recommendations"
            icon={<FaLightbulb />}
            color="primary"
            isOpen={expandedSection === 'recommendations'}
            toggle={() => toggleSection('recommendations')}
            delay={0.25}
          >
            <div className="space-y-3 p-1">
              {insights.recommendations.map((recommendation, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + (index * 0.05) }}
                  className="flex items-start group p-3 bg-primary-900/10 rounded-lg border border-primary-900/20 hover:bg-primary-900/15 transition-colors"
                >
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary-900/30 text-primary-500 mt-0.5 mr-3 group-hover:scale-110 transition-transform">
                    <FaLightbulb size={12} />
                  </div>
                  <span className="text-foreground-secondary">{recommendation}</span>
                </motion.div>
              ))}
            </div>
          </AccordionSection>
        </div>
        
        {/* Competitor Insights Section - Right Column */}
        <div className="glass-card rounded-xl border border-card-border p-5">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-secondary-900/30 text-secondary-500 mr-3">
              <FaChartLine size={14} />
            </div>
            Competitor Insights
          </h3>
          
          <div className="space-y-4">
            {insights.competitorInsights.map((competitor, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (index * 0.1) }}
                className="p-4 bg-secondary-900/10 rounded-lg border border-secondary-900/20 hover:bg-secondary-900/15 transition-colors"
              >
                <h4 className="font-medium text-foreground mb-3 flex items-center">
                  <div className="w-2 h-2 rounded-full bg-secondary-500 mr-2"></div>
                  {competitor.name}
                </h4>
                <ul className="space-y-2">
                  {competitor.insights.map((insight, i) => (
                    <li key={i} className="text-sm text-foreground-secondary flex items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-neutral-500 mt-1.5 mr-2 flex-shrink-0"></div>
                      {insight}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
          
          {/* Download/Share Actions */}
          <div className="mt-6 flex flex-wrap gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-sm flex items-center shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-4 py-2 rounded-lg bg-secondary-900/30 hover:bg-secondary-900/50 text-secondary-400 text-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </motion.button>
          </div>
        </div>
      </div>

      {/* CTA and Help - Bottom Section */}
      <div className="p-5 glass-card rounded-xl border border-card-border mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold text-foreground mb-1">Ready to accelerate your growth?</h3>
            <p className="text-sm text-foreground-tertiary">Our team can help implement these insights with a customized action plan.</p>
          </div>
          
          <div className="flex space-x-3">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-lg text-sm flex items-center shadow-sm bg-primary-600 hover:bg-primary-500 text-white"
            >
              <FaBolt className="mr-2" size={14} />
              Book Strategy Call
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-lg text-sm flex items-center shadow-sm bg-neutral-800 hover:bg-neutral-700 text-foreground-secondary"
            >
              <FaThumbsUp className="mr-2" size={14} />
              Feedback
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AccordionSection({ title, icon, color = "primary", isOpen, toggle, children, delay = 0 }) {
  // Color mapping for different section types
  const colorMap = {
    primary: {
      bg: "bg-primary-900/30",
      text: "text-primary-500",
      border: "border-primary-800",
      hover: "hover:bg-primary-900/40",
      gradient: "from-primary-900/20 to-primary-900/5"
    },
    secondary: {
      bg: "bg-secondary-900/30",
      text: "text-secondary-500",
      border: "border-secondary-800",
      hover: "hover:bg-secondary-900/40",
      gradient: "from-secondary-900/20 to-secondary-900/5"
    },
    success: {
      bg: "bg-success-900/30",
      text: "text-success-500",
      border: "border-success-800",
      hover: "hover:bg-success-900/40",
      gradient: "from-success-900/20 to-success-900/5"
    },
    warning: {
      bg: "bg-warning-900/30",
      text: "text-warning-500",
      border: "border-warning-800",
      hover: "hover:bg-warning-900/40",
      gradient: "from-warning-900/20 to-warning-900/5"
    }
  };
  
  const colorClass = colorMap[color] || colorMap.primary;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="border border-neutral-800 rounded-xl overflow-hidden backdrop-blur-sm shadow-md"
    >
      <motion.button
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
        onClick={toggle}
        className={`w-full flex justify-between items-center py-4 px-5 bg-background-secondary/50 ${colorClass.hover} focus:outline-none transition-colors`}
      >
        <div className="flex items-center">
          <div className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full ${colorClass.bg} ${colorClass.text} mr-3 shadow-inner`}>
            {icon}
          </div>
          <span className="font-semibold text-foreground text-lg">{title}</span>
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