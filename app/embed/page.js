'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { FaSearch, FaMapMarkerAlt, FaExclamationTriangle } from 'react-icons/fa';
import GmbDataDashboard from '../components/GmbDataDashboard';
import LoadingState from '../components/LoadingState';
import './embed.css';

export default function EmbedPage() {
  const [businessData, setBusinessData] = useState(null);
  const [competitors, setCompetitors] = useState([]);
  const [seoData, setSeoData] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gmbUrl, setGmbUrl] = useState('');
  const [currentStep, setCurrentStep] = useState(null);
  
  // Get query parameters for customization
  const searchParams = useSearchParams();
  const primaryColor = searchParams.get('primaryColor');
  const secondaryColor = searchParams.get('secondaryColor');
  const theme = searchParams.get('theme') || 'dark';

  // Generate mock SEO data for a business
  const generateMockSeoData = (business) => {
    if (!business) return null;
    
    const domain = business.website ? 
      new URL(business.website).hostname.replace('www.', '') : 
      `${business.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
    
    // Generate realistic-looking metrics based on business rating
    const ratingFactor = business.rating / 5; // Higher rating = better SEO metrics
    
    return {
      domain,
      domainAuthority: Math.floor(25 + (ratingFactor * 50)), // 25-75 range
      monthlyTraffic: Math.floor(500 + (ratingFactor * 19500)), // 500-20,000 range
      backlinks: Math.floor(50 + (ratingFactor * 950)), // 50-1,000 range
      rankingKeywords: Math.floor(20 + (ratingFactor * 480)), // 20-500 range
      isEstimated: true // Flag that this is mock data
    };
  };

  useEffect(() => {
    // Apply theme or custom colors if provided
    if (primaryColor) {
      document.documentElement.style.setProperty('--primary-500', primaryColor);
    }
    
    if (secondaryColor) {
      document.documentElement.style.setProperty('--secondary-500', secondaryColor);
    }
    
    // Force dark mode for now as the default theme
    document.documentElement.classList.add('dark');
  }, [primaryColor, secondaryColor, theme]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!gmbUrl.trim()) {
      setError('Please enter your Google Maps business URL');
      return;
    }
    
    try {
      setLoading(true);
      setCurrentStep('fetchingGmb');
      setError(null);
      
      // Step 1: Fetch GMB data from API
      const gmbResponse = await fetch('/api/gmb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileUrl: gmbUrl,
        }),
      });
      
      if (!gmbResponse.ok) {
        const errorData = await gmbResponse.json();
        throw new Error(errorData.error || 'Failed to fetch business data');
      }
      
      const gmbData = await gmbResponse.json();
      setBusinessData(gmbData);
      
      // Step 2: Fetch competitors based on business location and category
      setCurrentStep('fetchingCompetitors');
      let competitorsData = [];
      try {
        const competitorsResponse = await fetch('/api/competitors', {
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
        
        if (competitorsResponse.ok) {
          competitorsData = await competitorsResponse.json();
          setCompetitors(competitorsData);
        } else {
          console.warn('Failed to fetch competitors, using default data');
          competitorsData = [
            { name: 'Competitor 1', rating: 4.2, reviews: 98 },
            { name: 'Competitor 2', rating: 4.0, reviews: 87 },
            { name: 'Competitor 3', rating: 4.7, reviews: 63 }
          ];
          setCompetitors(competitorsData);
        }
      } catch (error) {
        console.warn('Error fetching competitors:', error);
        competitorsData = [
          { name: 'Competitor 1', rating: 4.2, reviews: 98 },
          { name: 'Competitor 2', rating: 4.0, reviews: 87 },
          { name: 'Competitor 3', rating: 4.7, reviews: 63 }
        ];
        setCompetitors(competitorsData);
      }
      
      // Step 3: Fetch SEO data if available
      setCurrentStep('fetchingSeo');
      let seoDataResult = null;
      try {
        const seoResponse = await fetch('/api/seo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            businessName: gmbData.name,
            website: gmbData.website,
            competitors: competitorsData.map(c => c.name).join(',')
          }),
        });
        
        if (seoResponse.ok) {
          seoDataResult = await seoResponse.json();
          setSeoData(seoDataResult);
        } else {
          // Generate mock SEO data if API fails
          seoDataResult = generateMockSeoData(gmbData);
          setSeoData(seoDataResult);
        }
      } catch (error) {
        console.warn('Error fetching SEO data:', error);
        // Generate mock SEO data if API fails
        seoDataResult = generateMockSeoData(gmbData);
        setSeoData(seoDataResult);
      }
      
      // Step 4: Generate AI insights
      setCurrentStep('generatingInsights');
      try {
        const aiResponse = await fetch('/api/ai-insights', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            businessData: gmbData,
            competitors: competitorsData,
            seoData: seoDataResult || generateMockSeoData(gmbData)
          }),
        });
        
        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          setAiInsights(aiData);
        }
      } catch (error) {
        console.warn('Error generating AI insights:', error);
      }
      
    } catch (err) {
      setError('Failed to analyze business data: ' + (err.message || 'Unknown error'));
      console.error(err);
    } finally {
      setLoading(false);
      setCurrentStep(null);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 flex flex-col embed-container">
      {!businessData && !loading && (
        <div className="w-full">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">Business Comparison Tool</h1>
            <p className="text-gray-400 mb-6">Enter your Google Maps business URL to analyze your performance</p>
          </div>
          
          <div className="max-w-xl mx-auto glass-card p-6 rounded-xl border border-card-border shadow-float backdrop-blur-sm">
            <form onSubmit={handleSubmit}>
              <label htmlFor="gmb-url" className="block text-sm font-medium text-foreground mb-2">
                Google Maps Business URL
              </label>
              
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaMapMarkerAlt className="text-gray-500" />
                </div>
                <input
                  id="gmb-url"
                  type="text"
                  value={gmbUrl}
                  onChange={(e) => setGmbUrl(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 border border-neutral-700 bg-neutral-800/60 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-foreground text-sm"
                  placeholder="https://www.google.com/maps/place/Your+Business+Name/..."
                />
              </div>
              
              <div className="flex items-center text-xs text-gray-400 mb-4">
                <FaSearch className="mr-2" size={12} />
                <span>How to find your Google Maps URL? Go to Google Maps, search your business, and copy the URL from your browser.</span>
              </div>
              
              <button
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium rounded-lg hover:from-primary-500 hover:to-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-lg flex items-center justify-center"
              >
                <FaSearch className="mr-2" size={14} />
                Analyze Business
              </button>
            </form>
          </div>
        </div>
      )}
      
      {loading && <LoadingState message={
        currentStep === 'fetchingGmb' ? 'Analyzing your business data...' :
        currentStep === 'fetchingCompetitors' ? 'Finding your competitors...' :
        currentStep === 'fetchingSeo' ? 'Analyzing SEO metrics...' :
        currentStep === 'generatingInsights' ? 'Generating AI insights...' :
        'Processing your business data...'
      } />}
      
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-300 p-4 rounded-lg mb-6">
          <div className="flex items-center">
            <FaExclamationTriangle className="text-red-500 mr-2" />
            <p>{error}</p>
          </div>
        </div>
      )}
      
      {businessData && !loading && (
        <GmbDataDashboard 
          businessData={businessData}
          competitors={competitors}
          seoData={seoData}
          aiInsights={aiInsights}
          isEmbedded={true}
          onReset={() => {
            setBusinessData(null);
            setCompetitors([]);
            setSeoData(null);
            setAiInsights(null);
            setGmbUrl('');
          }}
        />
      )}
      
      <div className="mt-auto pt-4 text-xs text-center text-gray-500">
        Powered by Business Comparison Tool
      </div>
    </div>
  );
} 