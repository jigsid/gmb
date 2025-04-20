import { useState } from 'react';
import { FaBrain, FaChevronDown, FaChevronUp, FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function AiInsights({ insights }) {
  const [expandedSection, setExpandedSection] = useState('summary');

  if (!insights) return null;

  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-white p-6 rounded-xl shadow-md border-l-4 border-primary"
    >
      <div className="flex items-center mb-4">
        <FaBrain className="text-primary mr-2" size={24} />
        <h2 className="text-xl font-bold text-gray-800">AI-Powered Insights</h2>
      </div>

      {/* Summary Section - Always Visible */}
      <div className="mb-6">
        <p className="text-gray-700">{insights.summary}</p>
      </div>

      {/* Accordion Sections */}
      <div className="space-y-3">
        {/* Strengths Section */}
        <AccordionSection 
          title="Strengths"
          isOpen={expandedSection === 'strengths'}
          toggle={() => toggleSection('strengths')}
        >
          <ul className="list-disc pl-5 space-y-2">
            {insights.strengths.map((strength, index) => (
              <li key={index} className="text-gray-700">{strength}</li>
            ))}
          </ul>
        </AccordionSection>

        {/* Weaknesses Section */}
        <AccordionSection 
          title="Areas for Improvement"
          isOpen={expandedSection === 'weaknesses'}
          toggle={() => toggleSection('weaknesses')}
        >
          <ul className="list-disc pl-5 space-y-2">
            {insights.weaknesses.map((weakness, index) => (
              <li key={index} className="text-gray-700">{weakness}</li>
            ))}
          </ul>
        </AccordionSection>

        {/* Recommendations Section */}
        <AccordionSection 
          title="Recommendations"
          isOpen={expandedSection === 'recommendations'}
          toggle={() => toggleSection('recommendations')}
        >
          <ul className="list-disc pl-5 space-y-2">
            {insights.recommendations.map((recommendation, index) => (
              <li key={index} className="text-gray-700">{recommendation}</li>
            ))}
          </ul>
        </AccordionSection>

        {/* Competitor Insights Section */}
        <AccordionSection 
          title="Competitor Insights"
          isOpen={expandedSection === 'competitorInsights'}
          toggle={() => toggleSection('competitorInsights')}
        >
          <div className="space-y-4">
            {insights.competitorInsights.map((competitor, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">{competitor.name}</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {competitor.insights.map((insight, i) => (
                    <li key={i} className="text-sm text-gray-700">{insight}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </AccordionSection>
      </div>

      {/* Feedback Section */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600 mb-2">Was this analysis helpful?</p>
        <div className="flex space-x-3">
          <button className="flex items-center px-3 py-1 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
            <FaThumbsUp className="text-gray-600 mr-2" size={14} />
            <span className="text-sm text-gray-700">Yes</span>
          </button>
          <button className="flex items-center px-3 py-1 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
            <FaThumbsDown className="text-gray-600 mr-2" size={14} />
            <span className="text-sm text-gray-700">No</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function AccordionSection({ title, isOpen, toggle, children }) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={toggle}
        className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 focus:outline-none transition-colors"
      >
        <span className="font-medium text-gray-800">{title}</span>
        {isOpen ? (
          <FaChevronUp className="text-gray-500" />
        ) : (
          <FaChevronDown className="text-gray-500" />
        )}
      </button>
      
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="p-4 border-t border-gray-200"
        >
          {children}
        </motion.div>
      )}
    </div>
  );
} 