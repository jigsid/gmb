// Test script for the Competitors API implementation with improved SerpAPI handling
const axios = require('axios');
require('dotenv').config({ path: '../../../.env' });

// SerpAPI key from environment variable
const SERPAPI_KEY = process.env.SERPAPI_KEY;

// Test data
const testData = {
  businessName: 'Taj Palace Hotel',
  category: 'Hotel',
  location: 'New Delhi'
};

/**
 * Build search query based on business data
 */
function buildSearchQuery(businessName, category, location) {
  // Process the category for better search results
  const searchCategory = normalizeCategory(category || determineCategory(businessName));
  
  // Build query
  let searchQuery = '';
  
  if (searchCategory && searchCategory !== 'Business') {
    searchQuery = `best ${searchCategory} competitors`;
  } else {
    searchQuery = 'top businesses';
  }
  
  if (location) {
    searchQuery += ` in ${location}`;
  }
  
  return searchQuery;
}

/**
 * Find competitors using SerpAPI
 */
async function findCompetitorsWithSerpApi(searchQuery) {
  try {
    console.log('Searching for competitors with query:', searchQuery);
    
    // Make the API request to SerpAPI
    const response = await axios.get('https://serpapi.com/search', {
      params: {
        api_key: SERPAPI_KEY,
        engine: 'google',
        q: searchQuery,
        google_domain: 'google.com',
        gl: 'in', // Set to India for localized results
        hl: 'en', // English language
        num: 10,  // Get top 10 results
      }
    });
    
    console.log('API Response status:', response.status);
    console.log('Response data keys:', Object.keys(response.data));
    
    // Process different result types
    let competitors = [];
    
    // 1. Try organic results first
    if (response.data.organic_results && response.data.organic_results.length > 0) {
      console.log('Found organic results:', response.data.organic_results.length);
      competitors = processOrganicResults(response.data.organic_results);
      
      if (competitors.length > 0) {
        console.log('Successfully processed organic results');
        return competitors.slice(0, 3);
      }
    }
    
    // 2. Try local results
    if (response.data.local_results && 
        response.data.local_results.places && 
        response.data.local_results.places.length > 0) {
      console.log('Found local results:', response.data.local_results.places.length);
      competitors = processLocalResults(response.data.local_results.places);
      
      if (competitors.length > 0) {
        console.log('Successfully processed local results');
        return competitors.slice(0, 3);
      }
    }
    
    // 3. Try knowledge graph
    if (response.data.knowledge_graph && response.data.knowledge_graph.competitors) {
      console.log('Found knowledge graph competitors');
      competitors = processKnowledgeGraphCompetitors(response.data.knowledge_graph.competitors);
      
      if (competitors.length > 0) {
        console.log('Successfully processed knowledge graph competitors');
        return competitors;
      }
    }
    
    // 4. Try extracting from other parts of the response
    if (response.data.related_searches && response.data.related_searches.length > 0) {
      console.log('Attempting to extract from related searches');
      competitors = extractBusinessesFromResponse(response.data);
      
      if (competitors.length > 0) {
        console.log('Successfully extracted potential businesses from response');
        return competitors.slice(0, 3);
      }
    }
    
    console.log('No suitable results found in the response');
    return [];
  } catch (error) {
    console.error('Error fetching competitors from SerpAPI:', error.message);
    throw error;
  }
}

/**
 * Process organic search results
 */
function processOrganicResults(results) {
  return results
    .filter(result => {
      // Filter out non-business results
      const excludedDomains = [
        'wikipedia.org', 'facebook.com', 'instagram.com', 'twitter.com',
        'linkedin.com', 'youtube.com', 'tripadvisor.com', 'yelp.com'
      ];
      if (!result.link) return false;
      return !excludedDomains.some(domain => result.link.includes(domain));
    })
    .map(result => {
      // Extract business name from title
      let name = result.title;
      const suffixIndex = name.indexOf(' - ');
      if (suffixIndex > 0) {
        name = name.substring(0, suffixIndex);
      }
      
      // Generate rating and reviews
      const rating = (3.5 + Math.random() * 1.5).toFixed(1);
      const reviews = Math.floor(Math.random() * 200) + 20;
      
      return {
        name: name,
        website: result.link,
        rating: parseFloat(rating),
        reviews: reviews,
        snippet: result.snippet,
        isEstimated: true
      };
    });
}

/**
 * Process local business results
 */
function processLocalResults(places) {
  return places.map(place => {
    return {
      name: place.title,
      address: place.address,
      rating: place.rating || parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
      reviews: place.reviews || Math.floor(Math.random() * 200) + 20,
      website: place.website,
      isEstimated: !place.rating
    };
  });
}

/**
 * Process knowledge graph competitors
 */
function processKnowledgeGraphCompetitors(competitors) {
  if (!Array.isArray(competitors)) {
    return [];
  }
  
  return competitors.map(comp => {
    const rating = (3.5 + Math.random() * 1.5).toFixed(1);
    const reviews = Math.floor(Math.random() * 200) + 20;
    
    return {
      name: comp.name,
      website: comp.link,
      rating: parseFloat(rating),
      reviews: reviews,
      isEstimated: true
    };
  });
}

/**
 * Extract businesses from any available response data
 */
function extractBusinessesFromResponse(responseData) {
  const businesses = [];
  
  // Try to extract from related searches
  if (responseData.related_searches && responseData.related_searches.length > 0) {
    const potentialBusinesses = responseData.related_searches
      .filter(search => {
        // Make sure query exists and is a string
        if (!search.query || typeof search.query !== 'string') return false;
        
        const query = search.query.toLowerCase();
        // Filter for business-like queries
        return !query.includes('how') && !query.includes('what') && 
               !query.includes('why') && !query.includes('when') &&
               !query.includes('where');
      })
      .map(search => {
        // Create a web-friendly version of the name
        const webName = search.query.toLowerCase()
          .replace(/[^\w\s]/gi, '')
          .replace(/\s+/g, '');
        
        return {
          name: search.query,
          website: `https://www.${webName}.com`,
          rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
          reviews: Math.floor(Math.random() * 200) + 20,
          isEstimated: true
        };
      });
    
    businesses.push(...potentialBusinesses);
  }
  
  return businesses;
}

/**
 * Normalize category for search
 */
function normalizeCategory(category) {
  if (!category) return 'businesses';
  
  // Map categories to search terms
  const categoryMap = {
    'Restaurant': 'restaurants',
    'Cafe': 'cafes coffee shops',
    'Hotel': 'hotels',
    'Lodging': 'hotels lodging',
    'Retail': 'retail shops',
    'Shopping Mall': 'shopping malls',
    'Medical': 'hospitals healthcare clinics',
    'Healthcare': 'hospitals healthcare clinics',
    'Education': 'schools education',
    'Place Of Worship': 'religious organizations',
    'Financial': 'banks financial services',
    'Financial Services': 'banks financial services',
    'Beauty': 'beauty salons spas',
    'Beauty Services': 'beauty salons spas',
    'Fitness': 'gyms fitness centers',
    'Business': 'businesses'
  };
  
  return categoryMap[category] || category;
}

/**
 * Determine category from business name
 */
function determineCategory(businessName) {
  const lowerName = businessName.toLowerCase();
  
  const categoryMap = {
    'restaurant': 'Restaurant',
    'cafe': 'Cafe',
    'hotel': 'Hotel',
    'lodge': 'Lodging',
    'resort': 'Lodging',
    'shop': 'Retail',
    'store': 'Retail',
    'mall': 'Shopping Mall'
  };
  
  for (const [keyword, category] of Object.entries(categoryMap)) {
    if (lowerName.includes(keyword)) {
      return category;
    }
  }
  
  return 'Business';
}

/**
 * Generate mock competitors as fallback
 */
function generateMockCompetitors() {
  console.log('Generating mock competitors as fallback');
  
  const category = testData.category || determineCategory(testData.businessName);
  const location = testData.location || 'Mumbai';
  
  return [
    {
      name: `Premium ${category} Ltd.`,
      website: `https://www.premium${category.toLowerCase()}.com`,
      rating: 4.7,
      reviews: 187,
      address: `123 Main St, ${location}`,
      isEstimated: true
    },
    {
      name: `${category} Experts Inc.`,
      website: `https://www.${category.toLowerCase()}experts.com`,
      rating: 4.5,
      reviews: 143,
      address: `456 Market St, ${location}`,
      isEstimated: true
    },
    {
      name: `Elite ${category} Group`,
      website: `https://www.elite${category.toLowerCase()}.com`,
      rating: 4.3,
      reviews: 98,
      address: `789 Commerce Ave, ${location}`,
      isEstimated: true
    }
  ];
}

// Main test function
async function testCompetitorsAPI() {
  console.log('Testing Competitors API with data:', testData);
  
  let competitors;
  
  if (SERPAPI_KEY) {
    console.log('SERPAPI_KEY found, attempting to use SerpAPI');
    try {
      const searchQuery = buildSearchQuery(
        testData.businessName, 
        testData.category, 
        testData.location
      );
      
      competitors = await findCompetitorsWithSerpApi(searchQuery);
      
      if (competitors && competitors.length > 0) {
        console.log('Successfully found competitors using SerpAPI');
      } else {
        console.log('No competitors found using SerpAPI, falling back to mock data');
        competitors = generateMockCompetitors();
      }
    } catch (error) {
      console.error('Error using SerpAPI:', error.message);
      console.log('Falling back to mock data');
      competitors = generateMockCompetitors();
    }
  } else {
    console.log('No SERPAPI_KEY found, using mock data');
    competitors = generateMockCompetitors();
  }
  
  console.log('Final competitors data:');
  console.log(JSON.stringify(competitors, null, 2));
}

// Run the test
testCompetitorsAPI()
  .then(() => console.log('Test completed'))
  .catch(err => console.error('Test failed:', err)); 