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
  FaPlus
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full glass-card p-7 rounded-2xl border border-card-border shadow-float backdrop-blur-sm"
    >
      <div className="flex items-center mb-5">
        <div className="relative mr-4">
          <div className="absolute inset-0 bg-primary-400 rounded-full opacity-20 animate-pulse-slow" />
          <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500">
            <FaRobot className="text-white" size={20} />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Growth Strategy Insights</h2>
          <p className="text-sm text-foreground-tertiary">AI-powered organic growth analysis</p>
        </div>
      </div>

      {/* Summary Section - Always Visible */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 p-5 bg-primary-900/10 backdrop-blur-sm rounded-xl border border-primary-900"
      >
        <p className="text-foreground-secondary leading-relaxed">{insights.summary}</p>
      </motion.div>

      {/* Accordion Sections */}
      <div className="space-y-4">
        {/* Strengths Section */}
        <AccordionSection 
          title="Strengths"
          icon={<FaCheckCircle />}
          color="success"
          isOpen={expandedSection === 'strengths'}
          toggle={() => toggleSection('strengths')}
          delay={0.15}
        >
          <div className="space-y-3">
            {insights.strengths.map((strength, index) => (
              <motion.div 
                key={index}
                className="flex items-start group"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + (index * 0.05) }}
              >
                <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-green-900/30 text-green-500 mt-0.5 mr-3 group-hover:scale-110 transition-transform">
                  <FaPlus size={10} />
                </div>
                <p className="text-foreground">{strength}</p>
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
          <ul className="space-y-3">
            {insights.weaknesses.map((weakness, index) => (
              <motion.li 
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + (index * 0.05) }}
                className="flex items-start group"
              >
                <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-500 mt-0.5 mr-3 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-foreground-secondary">{weakness}</span>
              </motion.li>
            ))}
          </ul>
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
          <ul className="space-y-3">
            {insights.recommendations.map((recommendation, index) => (
              <motion.li 
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + (index * 0.05) }}
                className="flex items-start group"
              >
                <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-500 mt-0.5 mr-3 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M10 1a6 6 0 00-3.815 10.631C7.237 12.5 8 13.443 8 14.456v.644a.75.75 0 00.572.729 6.016 6.016 0 002.856 0A.75.75 0 0012 15.1v-.644c0-1.013.762-1.957 1.815-2.825A6 6 0 0010 1zM8.863 17.414a.75.75 0 00-.226 1.483 9.066 9.066 0 002.726 0 .75.75 0 00-.226-1.483 7.553 7.553 0 01-2.274 0z" />
                  </svg>
                </div>
                <span className="text-foreground-secondary">{recommendation}</span>
              </motion.li>
            ))}
          </ul>
        </AccordionSection>

        {/* Competitor Insights Section */}
        {insights.competitorInsights.length > 0 && (
          <AnimatePresence>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-background-secondary/50 backdrop-blur-sm p-5 rounded-xl border border-neutral-800 hover:shadow-sm transition-shadow"
            >
              <h3 className="text-lg font-semibold text-foreground mb-3">Competitor Insights</h3>
              
              <div className="space-y-4">
                {insights.competitorInsights.map((competitor, index) => (
                  <div key={index} className="p-3 bg-neutral-900/70 rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">{competitor.name}</h4>
                    <ul className="space-y-2">
                      {competitor.insights.map((insight, i) => (
                        <li key={i} className="text-sm text-foreground-secondary flex items-start">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 mr-2 flex-shrink-0"></div>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Feedback Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-7 pt-4 border-t border-neutral-800"
      >
        <p className="text-sm text-foreground-tertiary mb-3">Was this growth analysis helpful?</p>
        <div className="flex space-x-2">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => giveFeedback(true)}
            disabled={feedbackGiven !== null}
            className={`px-4 py-1.5 rounded-full text-sm flex items-center transition-colors ${
              feedbackGiven === true 
                ? 'bg-primary-900/30 text-primary-500' 
                : 'bg-neutral-800 hover:bg-primary-900/30 text-foreground-secondary hover:text-primary-500'
            }`}
          >
            <FaThumbsUp className="mr-1.5" size={12} />
            Yes
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => giveFeedback(false)}
            disabled={feedbackGiven !== null}
            className={`px-4 py-1.5 rounded-full text-sm flex items-center transition-colors ${
              feedbackGiven === false 
                ? 'bg-neutral-700 text-foreground-secondary' 
                : 'bg-neutral-800 hover:bg-neutral-700 text-foreground-secondary'
            }`}
          >
            <FaThumbsDown className="mr-1.5" size={12} />
            No
          </motion.button>
        </div>
        
        {feedbackGiven !== null && (
          <motion.p 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 text-sm text-primary-500"
          >
            Thanks for your feedback! We'll continue improving our insights.
          </motion.p>
        )}
      </motion.div>
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
      hover: "hover:bg-primary-900/20"
    },
    secondary: {
      bg: "bg-secondary-900/30",
      text: "text-secondary-500",
      border: "border-secondary-800",
      hover: "hover:bg-secondary-900/20"
    },
    success: {
      bg: "bg-green-900/30",
      text: "text-green-500",
      border: "border-green-800",
      hover: "hover:bg-green-900/20"
    },
    warning: {
      bg: "bg-amber-900/30",
      text: "text-amber-500",
      border: "border-amber-800",
      hover: "hover:bg-amber-900/20"
    }
  };
  
  const colorClass = colorMap[color] || colorMap.primary;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="border border-neutral-800 rounded-xl overflow-hidden backdrop-blur-sm"
    >
      <motion.button
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
        onClick={toggle}
        className={`w-full flex justify-between items-center p-4 bg-background-secondary/50 ${colorClass.hover} focus:outline-none transition-colors`}
      >
        <div className="flex items-center">
          <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full ${colorClass.bg} ${colorClass.text} mr-3`}>
            {icon}
          </div>
          <span className="font-medium text-foreground">{title}</span>
        </div>
        <div className={`flex items-center justify-center w-6 h-6 rounded-full ${isOpen ? 'bg-neutral-700' : 'bg-neutral-800'} transition-colors`}>
          {isOpen ? (
            <FaChevronUp className="text-foreground-tertiary" size={12} />
          ) : (
            <FaChevronDown className="text-foreground-tertiary" size={12} />
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
            <div className="p-5 border-t border-neutral-800">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 