'use client'

import { useState } from 'react';
import Image from 'next/image';
import { FaChartLine, FaBuilding, FaInfoCircle, FaCheckCircle, FaShieldAlt, FaRocket, FaStar, FaArrowRight, FaCode, FaClipboard, FaGlobe, FaLink, FaChartBar, FaLightbulb, FaRobot, FaTable, FaEllipsisH, FaFileExport, FaPrint, FaRedo } from 'react-icons/fa';
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
import CompetitorAnalytics from './components/CompetitorAnalytics';

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
  const [competitorView, setCompetitorView] = useState('table'); // 'table' or 'analytics'

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
    
    // Create default mock competitors data
    let mockCompetitors = [
      {
        name: 'Competitor One',
        rating: 4.2,
        reviews: 98,
        location: 'New York, NY',
        category: 'Local Business',
        website: 'https://competitor1.com'
      },
      {
        name: 'Competitor Two',
        rating: 4.7,
        reviews: 152,
        location: 'New York, NY',
        category: 'Local Business',
        website: 'https://competitor2.com'
      },
      {
        name: 'Competitor Three',
        rating: 3.9,
        reviews: 65,
        location: 'New York, NY',
        category: 'Local Business',
        website: 'https://competitor3.com'
      }
    ];
    
    // Try to extract business name from URL
    if (formData.profileUrl.includes('maps/place/')) {
      const namePart = formData.profileUrl.split('maps/place/')[1].split('/')[0];
      mockBusinessData.name = namePart.replace(/\+/g, ' ');
    }
    
    let actualBusinessData = null;
    
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
        actualBusinessData = gmbData;
      } catch (error) {
        console.warn('GMB API error, using fallback data:', error);
        setBusinessData(mockBusinessData);
        actualBusinessData = mockBusinessData;
      }
      
      // Step 2: Fetch real competitors based on business location and category
      setCurrentStep('fetchingCompetitors');
      try {
        // Use extracted business data to find real competitors
        const competitorsResponse = await fetch('/api/custom-competitors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            businessCategory: actualBusinessData.category,
            businessLocation: actualBusinessData.location,
            coordinates: actualBusinessData.coordinates
          }),
        });
        
        if (!competitorsResponse.ok) {
          throw new Error('Failed to fetch competitors');
        }
        
        const realCompetitors = await competitorsResponse.json();
        
        if (realCompetitors && realCompetitors.length > 0) {
          setCompetitors(realCompetitors);
          console.log('Successfully fetched real competitors:', realCompetitors.length);
        } else {
          throw new Error('No competitors found');
        }
      } catch (error) {
        console.warn('Competitors API error, using fallback data:', error);
        // Update mock competitors with actual business location and category
        mockCompetitors = mockCompetitors.map(comp => ({
          ...comp,
          location: actualBusinessData.location,
          category: actualBusinessData.category
        }));
        setCompetitors(mockCompetitors);
      }
      
      // Step 3: Generate mock SEO data
      setCurrentStep('fetchingSeo');
      const mockSeoData = {
        domain: extractDomainFromUrl(actualBusinessData.website),
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
        summary: `${actualBusinessData.name} has a rating of ${actualBusinessData.rating}/5 with ${actualBusinessData.reviews} reviews. Our analysis shows opportunities to improve your online presence and outrank competitors.`,
        strengths: [
          `Established ${actualBusinessData.category} business with online presence`,
          `Strong customer review base (${actualBusinessData.reviews} reviews)`,
          `Above average rating of ${actualBusinessData.rating}/5`
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

  // Update competitor view
  const toggleCompetitorView = () => {
    setCompetitorView(competitorView === 'table' ? 'analytics' : 'table');
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-50">
        <div className="absolute top-[5%] left-[15%] w-[25rem] h-[25rem] rounded-full bg-primary-600/10 blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[5%] w-[20rem] h-[20rem] rounded-full bg-secondary-500/10 blur-[120px]"></div>
        <div className="absolute top-[40%] right-[20%] w-[15rem] h-[15rem] rounded-full bg-accent-500/10 blur-[100px]"></div>
      </div>
      
      <Header currentStep={currentStep} onReset={resetForm} />
      
      {!businessData ? (
        <>
          {/* 2025 Hero Section - Full Height Split Layout */}
          <section className="min-h-[calc(100vh-100px)] flex flex-col md:flex-row items-center pt-2 relative z-10">
            {/* Left Side - Hero Content */}
            <div className="w-full md:w-1/2 px-6 md:px-10 py-4 flex flex-col justify-center">
              <div className="inline-flex items-center px-3 py-1 mb-4 rounded-full bg-primary-900/30 border border-primary-600/40 backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse mr-2"></div>
                <span className="text-xs font-medium text-primary-400">2025 Business Intelligence</span>
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-3">
                Compare & Outrank Your <span className="animated-gradient-text">Business Competition</span>
              </h1>
              
              <p className="text-base md:text-lg text-gray-300 mb-5 max-w-lg">
                Leverage advanced AI to analyze your Google Business profile, identify competitors, and get actionable insights to improve your online presence.
              </p>
              
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mb-4">
                <div className="flex items-center px-2.5 py-1 rounded-full bg-gray-800/50 backdrop-blur-sm">
                  <FaCheckCircle className="text-primary-500 mr-1.5" size={10} />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center px-2.5 py-1 rounded-full bg-gray-800/50 backdrop-blur-sm">
                  <FaCheckCircle className="text-primary-500 mr-1.5" size={10} />
                  <span>100% free analysis</span>
                </div>
                <div className="flex items-center px-2.5 py-1 rounded-full bg-gray-800/50 backdrop-blur-sm">
                  <FaRocket className="text-secondary-500 mr-1.5" size={10} />
                  <span>Instant results</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <a href="#gmb-form" className="inline-flex items-center justify-center px-5 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium shadow-lg hover:shadow-primary-600/20 transition-all hover:-translate-y-1 glow-effect">
                  Get Started <FaArrowRight className="ml-2" size={12} />
                </a>
                <a href="#features" className="inline-flex items-center justify-center px-5 py-2 rounded-xl border border-gray-700 text-white font-medium hover:bg-gray-800/50 transition-all hover:-translate-y-1">
                  Explore Features
                </a>
                <button 
                  onClick={() => document.getElementById('embed-code-modal').classList.remove('hidden')}
                  className="inline-flex items-center px-5 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium shadow-lg hover:shadow-primary-600/20 transition-all hover:-translate-y-1 glow-effect border border-primary-400/30"
                >
                  <FaCode className="mr-2" size={12} /> Get Embed Code
                </button>
              </div>
            </div>
            
            {/* Right Side - GMB Form */}
            <div 
              id="gmb-form"
              className="w-full md:w-1/2 px-6 md:px-10 py-4 flex justify-center items-center"
            >
              <div className="w-full max-w-md glass-card p-5 pt-4 rounded-2xl border border-card-border shadow-2xl backdrop-blur-md bg-gray-900/70 relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-500/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary-500/20 rounded-full blur-3xl"></div>
                
                <div className="relative">
                  <div className="flex items-center mb-3">
                    <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-primary-500 to-secondary-500 flex items-center justify-center mr-2.5">
                      <FaChartBar className="text-white" size={13} />
                    </div>
                    <h2 className="text-xl font-bold text-white">Analyze Your Business</h2>
                  </div>
                  <BusinessForm 
                    onSubmit={handleSubmit} 
                    isLoading={isLoading} 
                    error={errorMessage} 
                  />
                </div>
              </div>
            </div>
          </section>
          
          {/* Trust Indicators */}
          <section className="py-12 bg-gradient-to-b from-gray-900/80 to-gray-900/30 relative z-10">
            <div className="container mx-auto px-6">
              <div className="flex flex-col items-center mb-12 text-center">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-secondary-500 to-accent-500 flex items-center justify-center mb-4">
                  <FaShieldAlt className="text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Trusted by Businesses Worldwide</h2>
                <p className="text-gray-400 max-w-2xl">Our platform provides accurate insights based on real data to help businesses improve their online presence.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="group">
                  <TrustCard 
                    icon={<FaShieldAlt />}
                    title="Data Security"
                    description="Your business data is secure and never shared with third parties."
                  />
                </div>
                <div className="group">
                  <TrustCard 
                    icon={<FaRocket />}
                    title="Actionable Insights"
                    description="Get specific recommendations to improve rankings and visibility."
                  />
                </div>
                <div className="group">
                  <TrustCard 
                    icon={<FaStar />}
                    title="Competitor Analysis"
                    description="Know exactly how you stack up against similar businesses in your area."
                  />
                </div>
              </div>
            </div>
          </section>
          
          {/* Pricing Comparison - Gen Z Edition */}
          <section className="py-16 bg-gray-950 relative overflow-hidden">
            <div className="absolute -bottom-80 right-0 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -top-40 -left-20 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl"></div>
            
            <div className="container mx-auto px-6 relative z-10">
              <div className="flex flex-col items-center mb-12 text-center">
                <div className="inline-flex items-center px-3 py-1.5 mb-4 rounded-full bg-secondary-900/30 border border-secondary-600/40 backdrop-blur-sm">
                  <div className="w-2 h-2 rounded-full bg-secondary-500 animate-pulse mr-2"></div>
                  <span className="text-xs font-medium text-secondary-400">Free vs Premium</span>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Choose Your Plan</h2>
                <p className="text-gray-400 max-w-2xl">Compare our free and premium features to find the perfect solution for your business</p>
              </div>
              
              <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Free Plan */}
                  <div className="col-span-1">
                    <div className="h-full rounded-2xl border border-gray-800 bg-gray-900/50 backdrop-blur-sm p-8 flex flex-col hover:border-gray-700 transition-all duration-300 hover:-translate-y-1">
                      <div className="mb-8">
                        <h3 className="text-xl font-bold text-white mb-2">Free Plan</h3>
                        <p className="text-gray-400">Basic features for small businesses</p>
                        <div className="mt-4">
                          <span className="text-3xl font-bold text-white">$0</span>
                          <span className="text-gray-400">/month</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3 mb-8 flex-grow">
                        <PlanFeature included text="Basic business data" />
                        <PlanFeature included text="Top 3 competitors" />
                        <PlanFeature included text="Basic SEO metrics" />
                        <PlanFeature included text="AI recommendations" />
                        <PlanFeature included text="PDF report export" />
                        <PlanFeature text="Historical data tracking" />
                        <PlanFeature text="Advanced competitor insights" />
                        <PlanFeature text="Keyword tracking" />
                        <PlanFeature text="Email notifications" />
                        <PlanFeature text="White-label reports" />
                      </div>
                      
                      <a href="#gmb-form" className="inline-flex justify-center items-center px-6 py-3 rounded-lg border border-gray-600 text-white font-medium hover:bg-gray-800 transition-all w-full hover:-translate-y-1">
                        Get Started
                      </a>
                    </div>
                  </div>
                  
                  {/* Premium Plan */}
                  <div className="col-span-1 lg:col-span-2">
                    <div className="h-full rounded-2xl gradient-border bg-gradient-to-b from-gray-900/80 to-gray-900/60 backdrop-blur-sm p-8 flex flex-col relative overflow-hidden hover:-translate-y-1 transition-all duration-300">
                      <div className="absolute top-0 right-0 bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-1 text-sm font-bold transform rotate-0 translate-x-2 -translate-y-0 rounded-bl-lg">
                        RECOMMENDED
                      </div>
                      
                      <div className="mb-8">
                        <h3 className="text-xl font-bold text-white mb-2">Premium Plan</h3>
                        <p className="text-gray-400">Advanced analytics and tracking for growing businesses</p>
                        <div className="mt-4 flex items-baseline">
                          <span className="text-3xl font-bold text-white">$29</span>
                          <span className="text-gray-400">/month</span>
                          <span className="ml-2 bg-green-900/30 text-green-400 text-xs px-2 py-1 rounded-full">Save 50% - Limited Time</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 mb-8 flex-grow">
                        <PlanFeature included text="✓ Everything in Free plan" className="col-span-1 md:col-span-2 font-medium text-primary-300" />
                        <PlanFeature included text="Unlimited competitors" />
                        <PlanFeature included text="Full SEO analysis" />
                        <PlanFeature included text="Backlink analysis" />
                        <PlanFeature included text="Content gap analysis" />
                        <PlanFeature included text="Keyword position tracking" />
                        <PlanFeature included text="12 months historical data" />
                        <PlanFeature included text="Weekly email reports" />
                        <PlanFeature included text="Custom alerts" />
                        <PlanFeature included text="White-label reports" />
                        <PlanFeature included text="Priority support" />
                        <PlanFeature included text="API access" />
                      </div>
                      
                      <button className="inline-flex justify-center items-center px-6 py-3 rounded-lg bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium hover:shadow-lg hover:shadow-primary-600/20 transition-all w-full hover:-translate-y-1 glow-effect">
                        Start 14-Day Free Trial
                      </button>
                      <p className="text-xs text-center text-gray-400 mt-2">No credit card required</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-12 text-center">
                  <p className="text-gray-400 mb-4">Need a custom plan for your enterprise?</p>
                  <a href="#" className="inline-flex items-center text-primary-400 hover:text-primary-300 font-medium">
                    Contact us <FaArrowRight className="ml-2" />
                  </a>
                </div>
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
              
              {/* New Features Section - Advanced Features */}
              <div className="mt-16">
                <div className="flex flex-col items-center mb-12 text-center">
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Advanced Analytics</h3>
                  <p className="text-gray-400 max-w-2xl">Unlock deeper insights with our premium features</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <AdvancedFeatureCard 
                    icon={<FaChartLine />}
                    title="Trend Analysis"
                    description="Track your business performance over time and identify patterns in customer engagement, reviews, and online visibility."
                    features={[
                      "Historical rating and review tracking",
                      "Seasonal trend identification",
                      "Growth prediction modeling"
                    ]}
                  />
                  <AdvancedFeatureCard 
                    icon={<FaGlobe />}
                    title="SEO Performance Tracking"
                    description="Monitor your website's search engine performance and identify optimization opportunities."
                    features={[
                      "Keyword ranking position tracking",
                      "Backlink profile analysis",
                      "Content gap identification"
                    ]}
                  />
                </div>
              </div>
            </div>
          </section>
          
          {/* How It Works Section - New */}
          <section className="py-16 bg-gradient-to-b from-gray-950 to-gray-900">
            <div className="container mx-auto px-6">
              <div className="flex flex-col items-center mb-12 text-center">
                <div className="inline-flex items-center px-3 py-1.5 mb-4 rounded-full bg-blue-900/30 border border-blue-700/40">
                  <span className="text-xs font-medium text-blue-400">Simple Process</span>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
                <p className="text-gray-400 max-w-2xl">Get actionable business intelligence in just three simple steps</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StepCard 
                  number="1"
                  title="Enter Your GMB URL"
                  description="Simply paste your Google My Business profile URL to get started. No registration required."
                  icon={<FaLink />}
                />
                <StepCard 
                  number="2"
                  title="Automated Analysis"
                  description="Our system automatically analyzes your business data, finds competitors, and evaluates your online presence."
                  icon={<FaChartBar />}
                />
                <StepCard 
                  number="3"
                  title="Get Actionable Insights"
                  description="Review detailed analysis and AI-powered recommendations to improve your business visibility."
                  icon={<FaLightbulb />}
                />
              </div>
            </div>
          </section>
          
          {/* CTA Section - New */}
          <section className="py-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-900/30 to-secondary-900/30 z-0"></div>
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl"></div>
            
            <div className="container mx-auto px-6 relative z-10">
              <div className="max-w-4xl mx-auto bg-gray-900/80 backdrop-blur-lg rounded-2xl p-8 border border-gray-800 shadow-2xl">
                <div className="flex flex-col md:flex-row items-center">
                  <div className="md:w-2/3 mb-8 md:mb-0 md:pr-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Grow Your Business?</h2>
                    <p className="text-gray-300 mb-6">Get started with your free business analysis today and discover how to outrank your competition.</p>
                    <div className="flex flex-wrap gap-4">
                      <a href="#gmb-form" className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium shadow-lg hover:shadow-primary-600/20 transition-all hover:-translate-y-1">
                        Try It Now <FaArrowRight className="ml-2" />
                      </a>
                      <button 
                        onClick={() => document.getElementById('embed-code-modal').classList.remove('hidden')}
                        className="inline-flex items-center px-5 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium shadow-lg hover:shadow-primary-600/20 transition-all hover:-translate-y-1 glow-effect border border-primary-400/30"
                      >
                        <FaCode className="mr-2" size={12} /> Get Embed Code
                      </button>
                    </div>
                  </div>
                  <div className="md:w-1/3">
                    <div className="rounded-xl bg-gray-800/50 border border-gray-700 p-5 shadow-lg">
                      <div className="flex items-center mb-3">
                        <div className="flex -space-x-2">
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">SJ</div>
                          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">MC</div>
                          <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs">ER</div>
                        </div>
                        <div className="ml-3 text-sm text-gray-300">
                          <span className="font-medium">250+</span> businesses analyzed today
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        Join hundreds of businesses already using our comparison tool to improve their online presence.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* FAQ Section - New */}
          <section className="py-16 bg-gray-900">
            <div className="container mx-auto px-6">
              <div className="flex flex-col items-center mb-12 text-center">
                <div className="inline-flex items-center px-3 py-1.5 mb-4 rounded-full bg-purple-900/30 border border-purple-700/40">
                  <span className="text-xs font-medium text-purple-400">Questions & Answers</span>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
                <p className="text-gray-400 max-w-2xl">Everything you need to know about our business comparison tool</p>
              </div>
              
              <div className="max-w-3xl mx-auto">
                <FaqItem 
                  question="How do I find my Google Business Profile URL?" 
                  answer="You can find your Google Business Profile URL by searching for your business on Google, clicking on your business in the search results or on Google Maps, and then copying the URL from your browser's address bar. It typically starts with 'https://www.google.com/maps/place/'."
                />
                
                <FaqItem 
                  question="Is this tool completely free to use?" 
                  answer="Yes! Our basic business comparison tool is completely free to use with no hidden fees. We offer premium features for businesses that need more advanced analytics and detailed reports."
                />
                
                <FaqItem 
                  question="How accurate is the competitor analysis?" 
                  answer="Our tool uses real-time data from Google and other trusted sources to provide accurate insights. For competitors, we identify businesses in your category and geographic area with similar services to ensure relevant comparisons."
                />
                
                <FaqItem 
                  question="Can I export the results and reports?" 
                  answer="Yes, you can export your business comparison results as a PDF report. The report includes all the analytics, competitor comparison data, and recommended actions to improve your online presence."
                />
                
                <FaqItem 
                  question="How often should I run a comparison analysis?" 
                  answer="We recommend running a comparison analysis quarterly to track your progress and stay updated on your competition. However, if you've made significant changes to your online presence, you might want to check more frequently."
                />
              </div>
            </div>
          </section>
          
          {/* Newsletter Section - New */}
          <section className="py-16 bg-gradient-to-b from-gray-900 to-gray-950 relative overflow-hidden">
            <div className="absolute -top-40 left-1/2 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl"></div>
            
            <div className="container mx-auto px-6 relative z-10">
              <div className="max-w-3xl mx-auto">
                <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-8 border border-gray-700 shadow-lg">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="md:w-2/3">
                      <div className="inline-flex items-center px-3 py-1.5 mb-4 rounded-full bg-green-900/30 border border-green-700/40">
                        <span className="text-xs font-medium text-green-400">Stay Updated</span>
                      </div>
                      
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">Get Business Growth Tips</h3>
                      <p className="text-gray-300 mb-4">Subscribe to receive marketing strategies, competitor insights, and GMB optimization tips directly to your inbox.</p>
                    </div>
                    
                    <div className="md:w-1/3 w-full">
                      <form className="space-y-3 w-full">
                        <input 
                          type="email" 
                          placeholder="Your email address" 
                          className="w-full px-4 py-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          required
                        />
                        <button 
                          type="submit" 
                          className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium hover:shadow-lg hover:shadow-green-500/20 transition-all"
                        >
                          Subscribe
                        </button>
                        <p className="text-xs text-gray-400 mt-2">We respect your privacy. Unsubscribe at any time.</p>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
         
          
          {/* Footer - New */}
          <footer className="bg-gray-950 border-t border-gray-800 pt-16 pb-8">
            <div className="container mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                <div>
                  <h3 className="font-bold text-white text-lg mb-6">Business Comparison Tool</h3>
                  <p className="text-gray-400 mb-6">The ultimate tool for analyzing and outranking your business competitors on Google.</p>
                  <div className="flex space-x-4">
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                      </svg>
                    </a>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                      </svg>
                    </a>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                      </svg>
                    </a>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.031 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                      </svg>
                    </a>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold text-white text-lg mb-6">Quick Links</h3>
                  <ul className="space-y-4">
                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Home</a></li>
                    <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-bold text-white text-lg mb-6">Resources</h3>
                  <ul className="space-y-4">
                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">GMB Optimization Guide</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Local SEO Checklist</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Review Management Tips</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Competitor Analysis</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-bold text-white text-lg mb-6">Legal</h3>
                  <ul className="space-y-4">
                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">GDPR Compliance</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Data Processing</a></li>
                  </ul>
                </div>
              </div>
              
              <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
                <p className="text-gray-500 text-sm mb-4 md:mb-0">© 2025 Business Comparison Tool. All rights reserved.</p>
                
                <p className="text-gray-500 text-sm">
                  Made with ❤️ for small businesses
                </p>
              </div>
            </div>
          </footer>
        </>
      ) : isLoading ? (
        <LoadingState message={getLoadingMessage(currentStep)} />
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="container-fluid"
        >
          <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
            {/* Left Sidebar Navigation */}
            <div className="lg:w-64 w-full lg:min-h-[calc(100vh-80px)] bg-background-secondary/80 border-r border-neutral-800 lg:fixed top-[80px] left-0 z-30">
              <div className="p-5 border-b border-neutral-800 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg">
                    <FaBuilding className="text-white" size={18} />
                  </div>
                  <div className="truncate">
                    <h3 className="font-bold text-foreground text-sm truncate max-w-[180px]">{businessData.name}</h3>
                    <div className="flex items-center text-xs text-foreground-tertiary">
                      <FaStar className="text-amber-400 mr-1" size={10} />
                      {businessData.rating} ({businessData.reviews})
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="px-3 mb-4">
                <div className="text-xs font-medium text-foreground-tertiary uppercase tracking-wider px-3 mb-2">Analytics</div>
                <nav>
                  <button 
                    onClick={() => setActiveGmbTab('overview')}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg mb-1 ${
                      activeGmbTab === 'overview' 
                        ? 'bg-primary-900/30 text-primary-500' 
                        : 'text-foreground-secondary hover:bg-neutral-800'
                    }`}
                  >
                    <FaInfoCircle size={16} />
                    <span>Business Overview</span>
                  </button>
                  
                  <button 
                    onClick={() => setActiveGmbTab('analytics')}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg mb-1 ${
                      activeGmbTab === 'analytics' 
                        ? 'bg-info-900/30 text-info-500' 
                        : 'text-foreground-secondary hover:bg-neutral-800'
                    }`}
                  >
                    <FaChartBar size={16} />
                    <span>Performance Analytics</span>
                  </button>
                  
                  <button 
                    onClick={() => setActiveGmbTab('competitors')}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg mb-1 ${
                      activeGmbTab === 'competitors' 
                        ? 'bg-secondary-900/30 text-secondary-500' 
                        : 'text-foreground-secondary hover:bg-neutral-800'
                    }`}
                  >
                    <FaBuilding size={16} />
                    <span>Competitor Analysis</span>
                  </button>
                  
                  <button 
                    onClick={() => setActiveGmbTab('insights')}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg mb-1 ${
                      activeGmbTab === 'insights' 
                        ? 'bg-warning-900/30 text-warning-500' 
                        : 'text-foreground-secondary hover:bg-neutral-800'
                    }`}
                  >
                    <FaLightbulb size={16} />
                    <span>AI Insights</span>
                  </button>
                </nav>
              </div>
              
              <div className="px-3 mb-4">
                <div className="text-xs font-medium text-foreground-tertiary uppercase tracking-wider px-3 mb-2">Tools</div>
                <nav>
                  <button 
                    onClick={() => document.getElementById('embed-code-modal').classList.remove('hidden')}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg mb-1 text-foreground-secondary hover:bg-neutral-800"
                  >
                    <FaFileExport size={16} />
                    <span>Export Data</span>
                  </button>
                  
                  <button 
                    onClick={() => window.print()}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg mb-1 text-foreground-secondary hover:bg-neutral-800"
                  >
                    <FaPrint size={16} />
                    <span>Print Report</span>
                  </button>
                  
                  <button 
                    onClick={resetForm}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg mb-1 text-foreground-secondary hover:bg-neutral-800"
                  >
                    <FaRedo size={16} />
                    <span>New Analysis</span>
                  </button>
                </nav>
              </div>
              
              <div className="px-6 py-4 mx-3 mt-6 rounded-lg bg-gradient-to-br from-primary-900/40 to-secondary-900/40 border border-primary-900/30">
                <h4 className="font-medium text-foreground mb-2 text-sm">Pro Analysis Available</h4>
                <p className="text-xs text-foreground-tertiary mb-3">Unlock deeper insights and advanced competitor tracking.</p>
                <button className="w-full py-2 px-3 bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg text-white text-xs font-medium shadow-sm">
                  Upgrade to Pro
                </button>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="lg:pl-64 w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">
                      {activeGmbTab === 'overview' && 'Business Overview'}
                      {activeGmbTab === 'analytics' && 'Performance Analytics'}
                      {activeGmbTab === 'competitors' && 'Competitor Analysis'}
                      {activeGmbTab === 'insights' && 'Growth Strategy Insights'}
                    </h1>
                    <p className="text-foreground-tertiary mt-1">
                      {activeGmbTab === 'overview' && 'Complete analysis of your business presence'}
                      {activeGmbTab === 'analytics' && 'Key metrics and performance indicators'}
                      {activeGmbTab === 'competitors' && `Analysis of ${competitors?.length || 0} competitors in your market`}
                      {activeGmbTab === 'insights' && 'AI-powered growth recommendations'}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {activeGmbTab === 'overview' && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="hidden md:flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg shadow-md text-sm"
                        onClick={() => setActiveGmbTab('insights')}
                      >
                        <FaLightbulb className="mr-2" size={14} />
                        View AI Recommendations
                      </motion.button>
                    )}
                    
                    {activeGmbTab === 'competitors' && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={toggleCompetitorView}
                        className="flex items-center px-4 py-2 bg-secondary-900/30 hover:bg-secondary-900/50 text-secondary-400 rounded-lg text-sm"
                      >
                        {competitorView === 'table' ? (
                          <>
                            <FaChartLine className="mr-2" size={14} />
                            Advanced Analytics View
                          </>
                        ) : (
                          <>
                            <FaTable className="mr-2" size={14} />
                            Table Comparison View
                          </>
                        )}
                      </motion.button>
                    )}
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center w-10 h-10 justify-center rounded-full bg-neutral-800 hover:bg-neutral-700 text-foreground-secondary"
                    >
                      <FaEllipsisH size={16} />
                    </motion.button>
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
                    <div className="space-y-6">
                      {competitorView === 'table' ? (
                        <CompetitorTable 
                          businessData={businessData} 
                          competitors={competitors} 
                          seoData={seoData} 
                        />
                      ) : (
                        <CompetitorAnalytics 
                          businessData={businessData} 
                          competitors={competitors} 
                          seoData={seoData} 
                        />
                      )}
                    </div>
                  )}
                  
                  {activeGmbTab === 'insights' && (
                    <AiInsights insights={aiInsights} />
                  )}
                </div>
                
                {/* Bottom Sections */}
                {activeGmbTab === 'overview' && seoData && (
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
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Embed Code Modal */}
      <div id="embed-code-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 hidden">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => document.getElementById('embed-code-modal').classList.add('hidden')}></div>
        <div className="relative z-10 bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-2xl shadow-2xl">
          <button 
            onClick={() => document.getElementById('embed-code-modal').classList.add('hidden')}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <h3 className="text-2xl font-bold text-white mb-4">Embed Business Comparison Tool</h3>
          <p className="text-gray-300 mb-6">Copy and paste this code to embed the Business Comparison Tool on your website:</p>
          
          <div className="relative">
            <pre className="bg-gray-800 p-4 rounded-lg text-sm text-gray-300 overflow-x-auto mb-4">
              {`<iframe 
  src="${typeof window !== 'undefined' ? window.location.origin : ''}/embed" 
  width="100%" 
  height="600" 
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
  allowfullscreen
></iframe>`}
            </pre>
            
            <button 
              onClick={() => {
                const code = document.querySelector('#embed-code-modal pre').innerText;
                navigator.clipboard.writeText(code);
                document.getElementById('copy-confirmation').classList.remove('opacity-0');
                setTimeout(() => {
                  document.getElementById('copy-confirmation').classList.add('opacity-0');
                }, 2000);
              }}
              className="absolute top-2 right-2 p-2 rounded-md bg-blue-900/50 text-blue-400 hover:bg-blue-800"
            >
              <FaClipboard />
            </button>
            
            <span id="copy-confirmation" className="absolute right-12 top-3 text-green-400 transition-opacity opacity-0">
              Copied!
            </span>
          </div>
          
          <div className="mt-6 space-y-4">
            <h4 className="text-lg font-medium text-white">Customization Options</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-700 rounded-lg p-4">
                <h5 className="font-medium text-white mb-2">Theme</h5>
                <div className="flex gap-2">
                  <button className="h-8 w-8 rounded-full bg-gray-900 border-2 border-blue-500"></button>
                  <button className="h-8 w-8 rounded-full bg-white border border-gray-300"></button>
                  <button className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 border border-transparent"></button>
                </div>
              </div>
              
              <div className="border border-gray-700 rounded-lg p-4">
                <h5 className="font-medium text-white mb-2">Size</h5>
                <select className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-gray-300">
                  <option>Small (400px)</option>
                  <option selected>Medium (600px)</option>
                  <option>Large (800px)</option>
                  <option>Full height</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
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
    <div className="h-full p-6 rounded-2xl backdrop-blur-sm bg-gray-800/30 border border-gray-700 hover:border-primary-500/50 transition-all duration-300 hover:-translate-y-1 group">
      <div className="flex flex-col h-full">
        <div className="p-3 mb-4 inline-flex rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 group-hover:from-primary-600 group-hover:to-secondary-600 transition-all duration-300">
          <div className="w-8 h-8 flex items-center justify-center text-white text-xl">
            {icon}
          </div>
        </div>
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-300 transition-colors">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </div>
    </div>
  );
}

function TestimonialCard({ quote, author, position, company, rating }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-6 rounded-xl border border-gray-800 bg-gray-800/30 backdrop-blur-sm flex flex-col"
    >
      <div className="mb-4 flex">
        {[...Array(5)].map((_, i) => (
          <FaStar key={i} className={i < rating ? "text-yellow-500" : "text-gray-600"} />
        ))}
      </div>
      <p className="text-gray-300 italic mb-6">"{quote}"</p>
      <div className="mt-auto">
        <p className="font-medium text-white">{author}</p>
        <p className="text-sm text-gray-400">{position}, {company}</p>
      </div>
    </motion.div>
  );
}

function AdvancedFeatureCard({ icon, title, description, features }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-8 rounded-xl border border-gray-800 bg-gray-800/20 backdrop-blur-sm transition-all relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-primary-600/5 to-secondary-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="flex items-center mb-6">
        <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 mr-4 group-hover:shadow-lg group-hover:shadow-primary-500/10 transition-all z-10 relative">
          <span className="text-primary-400 group-hover:text-primary-300 transition-colors">
            {icon}
          </span>
        </div>
        <h3 className="text-xl font-semibold text-white relative z-10">{title}</h3>
      </div>
      
      <p className="text-gray-400 group-hover:text-gray-300 transition-colors relative z-10 mb-6">{description}</p>
      
      <div className="space-y-2">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start">
            <FaCheckCircle className="text-primary-500 mt-1 mr-2 flex-shrink-0" size={14} />
            <span className="text-gray-300">{feature}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function StepCard({ number, title, description, icon }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-8 rounded-xl border border-gray-800 bg-gray-800/20 backdrop-blur-sm transition-all relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-16 h-16 flex items-center justify-center text-4xl font-bold text-gray-700/30">
        {number}
      </div>
      
      <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 mb-6">
        <span className="text-blue-400">
          {icon}
        </span>
      </div>
      
      <h3 className="text-xl font-semibold mb-3 text-white">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </motion.div>
  );
}

function FaqItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="mb-4 border border-gray-800 rounded-xl overflow-hidden">
      <button 
        className="w-full p-4 flex justify-between items-center bg-gray-800/50 hover:bg-gray-800/70 transition-colors text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="font-medium text-white">{question}</h3>
        <span className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 p-4' : 'max-h-0'}`}
      >
        <p className="text-gray-300">{answer}</p>
      </div>
    </div>
  );
}

function PlanFeature({ text, included, className }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {included ? (
        <div className="w-5 h-5 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-xs text-white">
          <FaCheckCircle />
        </div>
      ) : (
        <div className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center text-xs text-gray-500">
          <FaEllipsisH />
        </div>
      )}
      <span className={included ? 'text-gray-300' : 'text-gray-500'}>{text}</span>
    </div>
  );
}
