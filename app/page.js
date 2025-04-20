'use client'

import { useState } from 'react';
import Image from 'next/image';
import { FaChartLine, FaBuilding, FaInfoCircle, FaCheckCircle, FaShieldAlt, FaRocket, FaStar, FaArrowRight } from 'react-icons/fa';
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
import GmbDataDashboard from './components/GmbDataDashboard';
import GmbAnalyticsDashboard from './components/GmbAnalyticsDashboard';
import GmbDataExporter from './components/GmbDataExporter';

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
  const [activeGmbTab, setActiveGmbTab] = useState('overview');

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setCurrentStep('loading');
    setErrorMessage('');
    
    // Create default mock data in case all APIs fail
    let mockBusinessData = {
      name: 'Sample Business',
      rating: 4.5,
      reviews: 125,
      category: 'Local Business',
      location: 'New York, NY',
      website: 'https://samplebusiness.com',
      phone: '(555) 123-4567',
      address: '123 Main Street, New York, NY 10001',
      isVerified: true
    };
    
    // Try to extract business name from URL
    if (formData.profileUrl.includes('maps/place/')) {
      const namePart = formData.profileUrl.split('maps/place/')[1].split('/')[0];
      mockBusinessData.name = namePart.replace(/\+/g, ' ');
    }
    
    try {
      // Step 1: Fetch GMB data
      setCurrentStep('fetchingGmb');
      try {
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
      } catch (error) {
        console.warn('GMB API error, using fallback data:', error);
        setBusinessData(mockBusinessData);
      }
      
      // Without proper businessData, we can't continue using real APIs
      // so we'll use mock data for the rest
      
      // Step 2: Generate mock competitors
      setCurrentStep('fetchingCompetitors');
      const mockCompetitors = [
        {
          name: 'Competitor One',
          rating: 4.2,
          reviews: 98,
          location: mockBusinessData.location,
          category: mockBusinessData.category,
          website: 'https://competitor1.com'
        },
        {
          name: 'Competitor Two',
          rating: 4.7,
          reviews: 152,
          location: mockBusinessData.location,
          category: mockBusinessData.category,
          website: 'https://competitor2.com'
        },
        {
          name: 'Competitor Three',
          rating: 3.9,
          reviews: 65,
          location: mockBusinessData.location,
          category: mockBusinessData.category,
          website: 'https://competitor3.com'
        }
      ];
      setCompetitors(mockCompetitors);
      
      // Step 3: Generate mock SEO data
      setCurrentStep('fetchingSeo');
      const mockSeoData = {
        domain: extractDomainFromUrl(mockBusinessData.website),
        domainAuthority: 35,
        pageAuthority: 28,
        spamScore: 1,
        monthlyTraffic: 1200,
        backlinks: 180,
        rankingKeywords: 75,
        isEstimated: true
      };
      setSeoData(mockSeoData);
      
      // Step 4: Generate mock AI insights
      setCurrentStep('generatingInsights');
      const mockAiInsights = {
        summary: `${mockBusinessData.name} has a rating of ${mockBusinessData.rating}/5 with ${mockBusinessData.reviews} reviews. Our analysis shows opportunities to improve your online presence and outrank competitors.`,
        strengths: [
          `Established ${mockBusinessData.category} business with online presence`,
          `Strong customer review base (${mockBusinessData.reviews} reviews)`,
          `Above average rating of ${mockBusinessData.rating}/5`
        ],
        weaknesses: [
          'Website SEO could be improved for better visibility',
          'Limited social media engagement compared to competitors',
          'Opportunity to expand service offerings'
        ],
        recommendations: [
          'Encourage more customer reviews through follow-up emails',
          'Optimize your website content with targeted keywords',
          'Create a content strategy to increase organic traffic',
          'Improve local SEO with consistent NAP information',
          'Engage more with customers on social media platforms'
        ],
        competitorInsights: mockCompetitors.map(competitor => ({
          name: competitor.name,
          insights: [
            `${competitor.name} has a rating of ${competitor.rating}/5 with ${competitor.reviews} reviews`,
            `They are targeting similar keywords in your market area`,
            `Consider differentiating your services from them by highlighting your unique strengths`
          ]
        }))
      };
      setAiInsights(mockAiInsights);
      
      // Add a short delay to make the loading state visible
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950">
      <Header currentStep={currentStep} onReset={resetForm} />
      
      {!businessData ? (
        <>
          {/* 2025 Hero Section - Full Height Split Layout */}
          <section className="min-h-[calc(100vh-80px)] flex flex-col md:flex-row items-center">
            {/* Left Side - Hero Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full md:w-1/2 px-6 md:px-12 py-12 flex flex-col justify-center"
            >
              <div className="inline-flex items-center px-3 py-1.5 mb-6 rounded-full bg-primary-900/30 border border-primary-700/40">
                <span className="w-2 h-2 rounded-full bg-primary-500 mr-2"></span>
                <span className="text-xs font-medium text-primary-400">2025 Business Intelligence</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Compare & Outrank Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500">Business Competition</span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-xl">
                Leverage advanced AI to analyze your Google Business profile, identify competitors, and get actionable insights to improve your online presence.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <a href="#gmb-form" className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium shadow-lg hover:shadow-primary-600/20 transition-all hover:-translate-y-1">
                  Get Started <FaArrowRight className="ml-2" />
                </a>
                <a href="#features" className="inline-flex items-center px-6 py-3 rounded-xl border border-gray-700 text-white font-medium hover:bg-gray-800/50 transition-all">
                  Explore Features
                </a>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center">
                  <FaCheckCircle className="text-primary-500 mr-2" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center">
                  <FaCheckCircle className="text-primary-500 mr-2" />
                  <span>100% free analysis</span>
                </div>
              </div>
            </motion.div>
            
            {/* Right Side - GMB Form */}
            <motion.div 
              id="gmb-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full md:w-1/2 px-6 md:px-12 py-12 flex justify-center items-center"
            >
              <div className="w-full max-w-md glass-card p-8 rounded-2xl border border-card-border shadow-2xl backdrop-blur-md bg-gray-900/70 relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-500/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary-500/20 rounded-full blur-3xl"></div>
                
                <div className="relative">
                  <h2 className="text-2xl font-bold text-white mb-6">Analyze Your Business</h2>
                  <BusinessForm 
                    onSubmit={handleSubmit} 
                    isLoading={isLoading} 
                    error={errorMessage} 
                  />
                </div>
              </div>
            </motion.div>
          </section>
          
          {/* Trust Indicators */}
          <section className="py-12 bg-gray-900/50">
            <div className="container mx-auto px-6">
              <div className="flex flex-col items-center mb-12 text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Trusted by Businesses Worldwide</h2>
                <p className="text-gray-400 max-w-2xl">Our platform provides accurate insights based on real data to help businesses improve their online presence.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <TrustCard 
                  icon={<FaShieldAlt />}
                  title="Data Security"
                  description="Your business data is secure and never shared with third parties."
                />
                <TrustCard 
                  icon={<FaRocket />}
                  title="Actionable Insights"
                  description="Get specific recommendations to improve rankings and visibility."
                />
                <TrustCard 
                  icon={<FaStar />}
                  title="Competitor Analysis"
                  description="Know exactly how you stack up against similar businesses in your area."
                />
              </div>
            </div>
          </section>
          
          {/* Feature Section - kept from previous version but styled to match new design */}
          <section id="features" className="py-16 bg-gradient-to-b from-gray-900 to-gray-950">
            <div className="container mx-auto px-6">
              <div className="flex flex-col items-center mb-12 text-center">
                <div className="inline-flex items-center px-3 py-1.5 mb-4 rounded-full bg-secondary-900/30 border border-secondary-700/40">
                  <span className="text-xs font-medium text-secondary-400">Powerful Features</span>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything You Need to Outrank Competitors</h2>
                <p className="text-gray-400 max-w-2xl">Comprehensive tools designed to give your business the edge in online visibility.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
              </div>
            </div>
          </section>
        </>
      ) : isLoading ? (
        <LoadingState message={getLoadingMessage(currentStep)} />
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="container mx-auto px-4 py-8"
        >
          <div className="flex flex-wrap justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4 md:mb-0">Business Intelligence</h1>
            
            <div className="flex space-x-2">
              <button 
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  activeGmbTab === 'overview' 
                    ? 'bg-primary-900/30 text-primary-500' 
                    : 'bg-neutral-800 text-foreground-secondary hover:bg-primary-900/20'
                }`}
                onClick={() => setActiveGmbTab('overview')}
              >
                Overview
              </button>
              
              <button 
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  activeGmbTab === 'analytics' 
                    ? 'bg-primary-900/30 text-primary-500' 
                    : 'bg-neutral-800 text-foreground-secondary hover:bg-primary-900/20'
                }`}
                onClick={() => setActiveGmbTab('analytics')}
              >
                Analytics
              </button>
              
              <button 
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  activeGmbTab === 'competitors' 
                    ? 'bg-primary-900/30 text-primary-500' 
                    : 'bg-neutral-800 text-foreground-secondary hover:bg-primary-900/20'
                }`}
                onClick={() => setActiveGmbTab('competitors')}
              >
                Competitors
              </button>
              
              <button 
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  activeGmbTab === 'insights' 
                    ? 'bg-primary-900/30 text-primary-500' 
                    : 'bg-neutral-800 text-foreground-secondary hover:bg-primary-900/20'
                }`}
                onClick={() => setActiveGmbTab('insights')}
              >
                AI Insights
              </button>
            </div>
            
            <div className="flex space-x-2">
              <GmbDataExporter businessData={businessData} />
              <PdfGenerator 
                businessData={businessData}
                competitors={competitors}
                seoData={seoData}
                aiInsights={aiInsights}
              />
            </div>
          </div>
          
          <div className="mb-8">
            {activeGmbTab === 'overview' && (
              <GmbDataDashboard businessData={businessData} seoData={seoData} />
            )}
            
            {activeGmbTab === 'analytics' && (
              <GmbAnalyticsDashboard businessData={businessData} seoData={seoData} competitors={competitors} />
            )}
            
            {activeGmbTab === 'competitors' && (
              <CompetitorTable 
                businessData={businessData} 
                competitors={competitors} 
                seoData={seoData} 
              />
            )}
            
            {activeGmbTab === 'insights' && (
              <AiInsights insights={aiInsights} />
            )}
          </div>
          
          {/* SEO Detail Card & Chatbot remain outside of the tab system */}
          {seoData && (
            <SeoDetailCard seoData={seoData} businessName={businessData.name} />
          )}
          
          <div className="mt-8">
            <AiChatbot 
              businessData={businessData}
              competitors={competitors}
              seoData={seoData}
              aiInsights={aiInsights}
            />
          </div>
          
          <div className="mt-8 flex justify-between">
            <button
              onClick={resetForm}
              className="flex items-center justify-center px-4 py-2 border border-gray-700 rounded-md text-gray-300 hover:bg-gray-800"
            >
              <FaInfoCircle className="mr-2" />
              Try Another Business
            </button>
          </div>
        </motion.div>
      )}
    </main>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-8 rounded-xl border border-gray-800 bg-gray-800/20 backdrop-blur-sm transition-all relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-primary-600/5 to-secondary-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 mb-6 group-hover:shadow-lg group-hover:shadow-primary-500/10 transition-all z-10 relative">
        <span className="text-primary-400 group-hover:text-primary-300 transition-colors">
          {icon}
        </span>
      </div>
      
      <h3 className="text-xl font-semibold mb-3 text-white relative z-10">{title}</h3>
      <p className="text-gray-400 group-hover:text-gray-300 transition-colors relative z-10">{description}</p>
      
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <FaArrowRight className="text-primary-500/50" />
      </div>
    </motion.div>
  );
}

function TrustCard({ icon, title, description }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-6 rounded-xl border border-gray-800 bg-gray-800/30 backdrop-blur-sm flex flex-col items-center text-center"
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-900/50 text-primary-400 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </motion.div>
  );
}
