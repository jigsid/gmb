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

  const resetForm = () => {
    setBusinessData(null);
    setCompetitors(null);
    setSeoData(null);
    setAiInsights(null);
    setErrorMessage('');
    setCurrentStep('input');
  };

  const loadingMessages = {
    loading: 'Loading your comparison...',
    fetchingGmb: 'Fetching your business details...',
    fetchingCompetitors: 'Identifying top competitors...',
    fetchingSeo: 'Analyzing SEO metrics...',
    generatingInsights: 'Generating AI insights...',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <FaChartLine className="text-primary h-8 w-8 mr-3" />
            <h1 className="text-xl font-bold text-gray-900">Business Comparison Tool</h1>
          </div>
          
          {currentStep === 'results' && (
            <button
              onClick={resetForm}
              className="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
            >
              Compare Another Business
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep === 'input' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Compare Your Business</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Enter your Google My Business profile URL to get insights into your online performance compared to competitors. 
                Our AI will analyze reviews, SEO metrics, and provide actionable recommendations.
              </p>
            </div>
            
            <BusinessForm onSubmit={handleSubmit} isLoading={isLoading} error={errorMessage} />
            
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<FaBuilding className="h-8 w-8 text-primary" />}
                title="GMB Profile Analysis"
                description="Enter your GMB profile URL and discover how your business compares to top competitors in your area."
              />
              <FeatureCard 
                icon={<FaChartLine className="h-8 w-8 text-primary" />}
                title="SEO Performance"
                description="Get insights into your website's authority and traffic compared to competitors."
              />
              <FeatureCard 
                icon={<FaInfoCircle className="h-8 w-8 text-primary" />}
                title="AI Recommendations"
                description="Receive personalized suggestions to improve your online presence and outperform competitors."
              />
            </div>
          </motion.div>
        )}
        
        {['loading', 'fetchingGmb', 'fetchingCompetitors', 'fetchingSeo', 'generatingInsights'].includes(currentStep) && (
          <LoadingState message={loadingMessages[currentStep]} />
        )}
        
        {currentStep === 'results' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
                Results for {businessData?.name}
              </h2>
              <PdfGenerator 
                businessData={businessData}
                competitors={competitors}
                seoData={seoData}
                aiInsights={aiInsights}
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <BusinessMetrics businessData={businessData} seoData={seoData} />
              
              <AiChatbot 
                businessData={businessData}
                competitors={competitors}
                seoData={seoData}
                aiInsights={aiInsights}
              />
            </div>
            
            <CompetitorTable 
              businessData={businessData}
              competitors={competitors}
              seoData={seoData}
            />
            
            {seoData && businessData?.website && (
              <SeoDetailCard 
                seoData={seoData} 
                businessName={businessData.name} 
              />
            )}
            
            <AiInsights insights={aiInsights} />
            
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 mb-4">
                Need to embed this tool? Use this code snippet to allow users to find and compare businesses using GMB profile URLs:
              </p>
              <div className="bg-gray-100 rounded-md p-4 text-sm font-mono text-gray-700 overflow-x-auto">
                {`<iframe src="https://your-tool-url.com" width="100%" height="800px" frameborder="0"></iframe>`}
              </div>
        </div>
          </motion.div>
        )}
      </main>
      
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            Business Comparison Tool © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex items-center mb-4">
        {icon}
        <h3 className="ml-3 text-lg font-medium text-gray-900">{title}</h3>
      </div>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
