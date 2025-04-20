'use client'

import { useState } from 'react';
import Image from 'next/image';
import { FaChartLine, FaBuilding, FaInfoCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';

// Components
import BusinessForm from './components/BusinessForm';
import BusinessMetrics from './components/BusinessMetrics';
import CompetitorTable from './components/CompetitorTable';
import AiInsights from './components/AiInsights';
import AiChatbot from './components/AiChatbot';
import PdfGenerator from './components/PdfGenerator';
import LoadingState from './components/LoadingState';
import SeoDetailCard from './components/SeoDetailCard';
import Header from './components/Header';

/**
 * Helper function to extract domain from a URL
 */
function extractDomainFromUrl(url) {
  if (!url) return '';
  
  try {
    // Add protocol if not present
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    const domain = new URL(url).hostname;
    return domain.startsWith('www.') ? domain.substring(4) : domain;
  } catch (error) {
    console.error('Error extracting domain:', error);
    // Simple fallback
    const urlParts = url.replace(/^https?:\/\//, '').split('/');
    return urlParts[0];
  }
}

export default function Home() {
  const [businessData, setBusinessData] = useState(null);
  const [competitors, setCompetitors] = useState(null);
  const [seoData, setSeoData] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState('input');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setCurrentStep('loading');
    setErrorMessage('');
    
    try {
      // Step 1: Fetch GMB data
      setCurrentStep('fetchingGmb');
      const gmbResponse = await fetch('/api/gmb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileUrl: formData.profileUrl,
        }),
      });
      
      if (!gmbResponse.ok) {
        const errorData = await gmbResponse.json();
        throw new Error(errorData.error || 'Failed to fetch business data');
      }
      
      const gmbData = await gmbResponse.json();
      setBusinessData(gmbData);
      
      // Step 2: Fetch competitors
      setCurrentStep('fetchingCompetitors');
      let competitorsResponse;
      try {
        competitorsResponse = await fetch('/api/competitors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            businessName: gmbData.name,
            location: gmbData.location,
            category: gmbData.category,
          }),
        });

        if (!competitorsResponse.ok) {
          const errorData = await competitorsResponse.json();
          console.error('Competitors API error:', errorData);
          // Don't throw error, just log it and continue with empty array
          setCompetitors([]);
        } else {
          const competitorsData = await competitorsResponse.json();
          console.log('Competitors data:', competitorsData);
          // Ensure we have an array even if the API returns null/undefined
          setCompetitors(Array.isArray(competitorsData) ? competitorsData : []);
        }
      } catch (competitorsError) {
        console.error('Error fetching competitors:', competitorsError);
        // Continue with empty array
        setCompetitors([]);
      }
      
      // Step 3: Fetch SEO metrics
      setCurrentStep('fetchingSeo');
      let seoResponse;
      try {
        // Only try to fetch SEO data if we have a website
        if (gmbData.website) {
          seoResponse = await fetch('/api/seo', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              website: gmbData.website,
              businessName: gmbData.name,
            }),
          });

          if (!seoResponse.ok) {
            const errorData = await seoResponse.json();
            console.error('SEO API error:', errorData);
            // Don't throw error, use a default object
            setSeoData({
              domain: extractDomainFromUrl(gmbData.website),
              domainAuthority: 30,
              pageAuthority: 25,
              spamScore: 1,
              monthlyTraffic: 500,
              backlinks: 100,
              rankingKeywords: 50,
              isEstimated: true
            });
          } else {
            const seoData = await seoResponse.json();
            console.log('SEO data:', seoData);
            setSeoData(seoData);
          }
        } else {
          // No website available, use default values
          console.log('No website available for SEO metrics');
          setSeoData({
            domain: gmbData.name.toLowerCase().replace(/\s+/g, '') + '.com',
            domainAuthority: 25,
            pageAuthority: 20,
            spamScore: 1,
            monthlyTraffic: 250,
            backlinks: 50,
            rankingKeywords: 20,
            isEstimated: true
          });
        }
      } catch (seoError) {
        console.error('Error fetching SEO metrics:', seoError);
        // Continue with default values
        setSeoData({
          domain: extractDomainFromUrl(gmbData.website || (gmbData.name + '.com')),
          domainAuthority: 25,
          pageAuthority: 20,
          spamScore: 1,
          monthlyTraffic: 300,
          backlinks: 75,
          rankingKeywords: 30,
          isEstimated: true
        });
      }
      
      // Step 4: Generate AI insights
      setCurrentStep('generatingInsights');
      try {
        // Only proceed if we have the required data
        if (gmbData && Array.isArray(competitors) && seoData) {
          const insightsResponse = await fetch('/api/ai-insights', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              businessData: gmbData,
              competitors: competitors,
              seoData: seoData,
            }),
          });
          
          if (!insightsResponse.ok) {
            const errorData = await insightsResponse.json();
            console.error('AI Insights API error:', errorData);
            // Don't throw error, use default insights
            setAiInsights({
              summary: `${gmbData.name} has a rating of ${gmbData.rating}/5 with ${gmbData.reviews} reviews. Focus on improving your online presence to stand out from competitors.`,
              strengths: [
                `Established business in the ${gmbData.category} category`,
                `Online presence with Google Maps listing`,
                `${gmbData.reviews} customer reviews`
              ],
              weaknesses: [
                'Could improve online visibility and SEO metrics',
                'Limited competitive analysis data available',
                'May need more customer engagement'
              ],
              recommendations: [
                'Encourage more customer reviews',
                'Optimize your website for better search visibility',
                'Analyze top competitors in your area',
                'Ensure accurate business information across all platforms',
                'Consider digital marketing campaigns to increase visibility'
              ],
              competitorInsights: competitors.map(competitor => ({
                name: competitor.name,
                insights: [
                  `${competitor.name} has a rating of ${competitor.rating}/5`,
                  `They have ${competitor.reviews} customer reviews`,
                  `They may be targeting similar customers in your area`
                ]
              }))
            });
          } else {
            const insightsData = await insightsResponse.json();
            console.log('AI Insights data:', insightsData);
            setAiInsights(insightsData);
          }
        } else {
          // Missing required data, use default insights
          console.warn('Missing data for AI insights, using defaults');
          setAiInsights({
            summary: `${gmbData.name} has a rating of ${gmbData.rating}/5 with ${gmbData.reviews} reviews. Continue improving your online presence to stand out in the ${gmbData.category} category.`,
            strengths: [
              `Established business in the ${gmbData.category} category`,
              `Online presence with Google Maps listing`,
              `${gmbData.reviews} customer reviews`
            ],
            weaknesses: [
              'Limited data available for comprehensive analysis',
              'Could improve competitive positioning',
              'May need more online engagement'
            ],
            recommendations: [
              'Encourage more customer reviews',
              'Improve your website SEO',
              'Monitor competitors regularly',
              'Maintain accurate business information',
              'Engage with customers on social platforms'
            ],
            competitorInsights: (Array.isArray(competitors) ? competitors : []).map(competitor => ({
              name: competitor.name,
              insights: [
                `${competitor.name} is a competitor in your area`,
                `Consider analyzing their business strategy`,
                `Look for opportunities to differentiate your services`
              ]
            }))
          });
        }
      } catch (insightsError) {
        console.error('Error generating AI insights:', insightsError);
        // Continue with default insights
        setAiInsights({
          summary: `${gmbData.name} operates in the ${gmbData.category} category with a ${gmbData.rating}/5 rating from ${gmbData.reviews} reviews.`,
          strengths: [
            'Established online presence',
            'Customer review base',
            'Google Maps visibility'
          ],
          weaknesses: [
            'Limited competitive analysis available',
            'Potential room for SEO improvement',
            'May need enhanced online strategy'
          ],
          recommendations: [
            'Gather more customer reviews',
            'Optimize website content',
            'Monitor and respond to customer feedback',
            'Analyze competitor strategies',
            'Maintain consistent business information online'
          ],
          competitorInsights: []
        });
      }
      
      // All done!
      setCurrentStep('results');
    } catch (error) {
      console.error('Error in data processing:', error);
      setErrorMessage(error.message || 'An error occurred while processing your request. Please try again.');
      setCurrentStep('input');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get loading message based on current step
  const getLoadingMessage = (step) => {
    const messages = {
      loading: "Loading your comparison...",
      fetchingGmb: "Extracting business data...",
      fetchingCompetitors: "Finding competitors in your area...",
      fetchingSeo: "Analyzing website performance...",
      generatingInsights: "Generating AI insights..."
    };
    return messages[step] || messages.loading;
  };

  const resetForm = () => {
    setBusinessData(null);
    setCompetitors(null);
    setSeoData(null);
    setAiInsights(null);
    setErrorMessage('');
    setCurrentStep('input');
  };

  return (
    <>
      <Header 
        currentStep={currentStep} 
        onReset={resetForm} 
      />
      <div className="min-h-screen bg-background">
        {currentStep === 'input' ? (
          <div className="container-fluid py-2">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-4xl mx-auto"
            >
             
              
              <BusinessForm 
                onSubmit={handleSubmit} 
                isLoading={isLoading} 
                error={errorMessage} 
              />
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 hidden md:grid"
              >
                {/* Feature cards - hidden on mobile to save space */}
                <FeatureCard 
                  icon={<FaChartLine />}
                  title="Competitor Analysis"
                  description="Compare ratings, reviews, and online presence with similar businesses in your area."
                />
                <FeatureCard 
                  icon={<FaBuilding />}
                  title="SEO Metrics"
                  description="Get detailed insights about your website's authority, traffic potential, and competitive gaps."
                />
                <FeatureCard 
                  icon={<FaInfoCircle />}
                  title="AI-Powered Recommendations"
                  description="Receive data-driven strategies to improve your online presence and outrank competitors."
                />
              </motion.div>
            </motion.div>
          </div>
        ) : currentStep === 'loading' ? (
          <div className="container-fluid py-16">
            <LoadingState message={getLoadingMessage(currentStep)} />
          </div>
        ) : (
          <div className="container-fluid py-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-5xl mx-auto"
            >
             
              
              <div className="flex flex-col md:flex-row justify-between items-start mb-8">
                <div>
                  <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white"
                  >
                    {businessData?.name || 'Your Business'}
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-gray-700 dark:text-gray-300 mt-1 font-medium flex items-center"
                  >
                    {businessData?.category || 'Business Category'} <span className="ml-2 text-xs py-0.5 px-2 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-500">Growth Analysis</span>
                  </motion.p>
                </div>
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <PdfGenerator 
                    businessData={businessData}
                    competitors={competitors}
                    seoData={seoData}
                    insights={aiInsights}
                  />
                </motion.div>
              </div>
              
              <div className="space-y-8">
                {businessData && (
                  <BusinessMetrics businessData={businessData} seoData={seoData} />
                )}
                
                {businessData && competitors && (
                  <CompetitorTable 
                    businessData={businessData} 
                    competitors={competitors}
                    seoData={seoData}
                  />
                )}
                
                {seoData && (
                  <SeoDetailCard seoData={seoData} businessName={businessData?.name} />
                )}
                
                {aiInsights && (
                  <AiInsights insights={aiInsights} />
                )}
                
                {businessData && (
                  <AiChatbot 
                    businessData={businessData}
                    competitors={competitors}
                    seoData={seoData}
                  />
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <motion.div 
      whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
      className="glass-card p-5 rounded-xl border border-card-border backdrop-blur-sm transition-all bg-white/80 dark:bg-gray-800/80"
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100 dark:bg-gradient-to-r dark:from-primary-500 dark:to-secondary-500 mb-4 shadow-md">
        <span className="text-primary-700 dark:text-white">
          {icon}
        </span>
      </div>
      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-sm text-gray-700 dark:text-gray-300">{description}</p>
    </motion.div>
  );
}
