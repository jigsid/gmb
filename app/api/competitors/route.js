import { NextResponse } from 'next/server';
import axios from 'axios';

// Get API key from environment variable
const SERPAPI_KEY = process.env.SERPAPI_KEY;

export async function POST(request) {
  try {
    const { businessName, location, category } = await request.json();
    
    if (!businessName) {
      return NextResponse.json(
        { error: 'Business name is required' },
        { status: 400 }
      );
    }

    console.log('Generating competitors for:', businessName, location, category);

    let competitors;
    let isApiSuccess = false;
    
    // Try to use SerpAPI to find real competitors
    if (SERPAPI_KEY) {
      try {
        const searchQuery = buildSearchQuery(businessName, category, location);
        console.log('Search query for competitors:', searchQuery);
        
        const realCompetitors = await findCompetitorsWithSerpApi(searchQuery);
        
        if (realCompetitors && realCompetitors.length > 0) {
          competitors = realCompetitors;
          isApiSuccess = true;
        }
      } catch (apiError) {
        console.error('SerpAPI error:', apiError.message);
        // We'll fall back to the mock data below
      }
    }
    
    // Fall back to mock data if API failed or no API key
    if (!isApiSuccess) {
      competitors = generateMockCompetitors(businessName, location, category);
      console.log('Using mock competitors data');
    }

    return NextResponse.json(competitors);
  } catch (error) {
    console.error('Competitors API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate competitors: ' + error.message },
      { status: 500 }
    );
  }
}

/**
 * Build search query based on available business data
 */
function buildSearchQuery(businessName, category, location) {
  // Normalize inputs
  let businessType = category || '';
  
  if (!businessType || businessType === 'Business') {
    // Try to determine category from business name
    businessType = determineCategory(businessName);
  }
  
  // Clean and normalize the business type
  const searchCategory = normalizeCategory(businessType);
  
  // Make sure we have a usable location
  let searchLocation = location || extractLocationFromName(businessName);
  
  // Check if location contains useful information
  const hasUsableLocation = searchLocation && 
                           searchLocation.length > 2 && 
                           !searchLocation.match(/^[0-9\s,]+$/);
  
  // Create a more targeted search query
  let searchQuery = '';
  
  // Check for accommodation types to make more targeted searches
  const isAccommodation = 
    searchCategory === 'Accommodation' || 
    searchCategory === 'Hotel' || 
    searchCategory === 'Resort' ||
    businessType === 'Accommodation' ||
    businessType === 'Hotel' ||
    businessType === 'Resort' ||
    businessName.toLowerCase().includes('resort') ||
    businessName.toLowerCase().includes('hotel') ||
    businessName.toLowerCase().includes('villa') ||
    businessName.toLowerCase().includes('lodge');
  
  // Exclude pattern - helps refine search by excluding the original business
  let excludePattern = '';
  if (businessName && businessName.length > 3) {
    const nameParts = businessName.split(/\s+/).filter(p => p.length > 3);
    if (nameParts.length > 0) {
      // Using the most distinctive part of the name to exclude
      excludePattern = ` -${nameParts[0]}`;
    }
  }
  
  // Handle different business types with specialized queries
  if (isAccommodation) {
    // For resorts/hotels, create a more targeted search
    let accommodationType = 'hotel';
    
    // Try to determine a more specific type of accommodation
    if (businessName.toLowerCase().includes('resort')) {
      accommodationType = 'resort';
    } else if (businessName.toLowerCase().includes('villa')) {
      accommodationType = 'villa';
    } else if (businessName.toLowerCase().includes('lodge')) {
      accommodationType = 'lodge';
    }
    
    // If we have a good location, prioritize it in the search
    if (hasUsableLocation) {
      searchQuery = `best ${accommodationType}s in ${searchLocation}${excludePattern}`;
    } else {
      searchQuery = `top rated ${accommodationType}s${excludePattern}`;
    }
  } 
  // Handle restaurant/food businesses
  else if (searchCategory === 'restaurants' || 
           businessType === 'Restaurant' || 
           businessType === 'Cafe' ||
           businessName.toLowerCase().includes('restaurant') ||
           businessName.toLowerCase().includes('cafe')) {
    
    // For restaurants, location-based search is crucial
    if (hasUsableLocation) {
      searchQuery = `best restaurants in ${searchLocation}${excludePattern}`;
    } else {
      searchQuery = `popular restaurants${excludePattern}`;
    }
  }
  // Handle retail businesses
  else if (searchCategory === 'retail shops' || 
           businessType === 'Retail' ||
           businessType === 'Shopping Mall') {
    
    if (hasUsableLocation) {
      searchQuery = `top shopping ${searchCategory} in ${searchLocation}${excludePattern}`;
    } else {
      searchQuery = `best ${searchCategory}${excludePattern}`;
    }
  }
  // Default case for other business types
  else if (searchCategory && searchCategory !== 'Business') {
    // For non-specialized businesses, use the standard approach
    if (hasUsableLocation) {
      searchQuery = `top ${searchCategory} in ${searchLocation}${excludePattern}`;
    } else {
      searchQuery = `best ${searchCategory}${excludePattern}`;
    }
  } else {
    // Fallback to a more generic search
    if (hasUsableLocation) {
      searchQuery = `popular businesses in ${searchLocation}${excludePattern}`;
    } else {
      searchQuery = `top rated businesses${excludePattern}`;
    }
  }
  
  console.log('Generated search query:', searchQuery);
  return searchQuery;
}

/**
 * Find competitors using SerpAPI
 */
async function findCompetitorsWithSerpApi(searchQuery) {
  try {
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
    
    // Check if we have organic results
    if (response.data && response.data.organic_results && response.data.organic_results.length > 0) {
      console.log('Found organic results:', response.data.organic_results.length);
      const competitors = processOrganicResults(response.data.organic_results);
      
      if (competitors.length > 0) {
        return competitors.slice(0, 3); // Return top 3 competitors
      }
    }
    
    // Check if we have local results
    if (response.data && 
        response.data.local_results && 
        response.data.local_results.places && 
        response.data.local_results.places.length > 0) {
      console.log('Found local results:', response.data.local_results.places.length);
      const competitors = processLocalResults(response.data.local_results.places);
      
      if (competitors.length > 0) {
        return competitors.slice(0, 3); // Return top 3 competitors
      }
    }
    
    // Check if we have knowledge graph
    if (response.data && 
        response.data.knowledge_graph && 
        response.data.knowledge_graph.competitors) {
      console.log('Found knowledge graph competitors');
      const competitors = processKnowledgeGraphCompetitors(response.data.knowledge_graph.competitors);
      
      if (competitors.length > 0) {
        return competitors; // These are already limited
      }
    }
    
    // Last resort: try to extract business listings from the raw HTML
    if (response.data && response.data.search_information && response.data.search_information.total_results > 0) {
      // Extract potential business names from titles
      const rawResults = extractBusinessesFromResponse(response.data);
      
      if (rawResults.length > 0) {
        return rawResults.slice(0, 3);
      }
    }
    
    console.log('No suitable results found in SerpAPI response');
    return [];
  } catch (error) {
    console.error('Error fetching competitors from SerpAPI:', error.message);
    throw error;
  }
}

/**
 * Process organic search results from SerpAPI
 */
function processOrganicResults(results) {
  return results
    .filter(result => {
      // Filter out non-business results (exclude Wikipedia, social media, etc.)
      const excludedDomains = [
        'wikipedia.org', 'facebook.com', 'instagram.com', 'twitter.com', 
        'linkedin.com', 'youtube.com', 'tripadvisor.com', 'yelp.com'
      ];
      if (!result.link) return false;
      return !excludedDomains.some(domain => result.link.includes(domain));
    })
    .map((result, index) => {
      // Extract business name from title (remove suffixes like "- Home | Facebook")
      let name = result.title;
      const suffixIndex = name.indexOf(' - ');
      if (suffixIndex > 0) {
        name = name.substring(0, suffixIndex);
      }
      
      // Generate realistic ratings between 3.5 and 5.0
      const rating = (3.5 + Math.random() * 1.5).toFixed(1);
      
      // Generate realistic review counts
      const reviews = Math.floor(Math.random() * 200) + 20;
      
      return {
        name: name,
        website: result.link,
        rating: parseFloat(rating),
        reviews: reviews,
        snippet: result.snippet,
        isEstimated: true // Rating/reviews are estimated since SerpAPI doesn't provide them for organic results
      };
    });
}

/**
 * Process local search results from SerpAPI (these are the most reliable for business comparison)
 */
function processLocalResults(places) {
  return places.map(place => {
    // Local results often have real ratings and reviews
    return {
      name: place.title || place.name,
      rating: place.rating || parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
      reviews: place.reviews || Math.floor(Math.random() * 200) + 20,
      address: place.address,
      website: place.website || `https://www.google.com/search?q=${encodeURIComponent(place.title || place.name)}`,
      category: place.type || 'Business',
      isEstimated: place.rating ? false : true
    };
  });
}

/**
 * Process knowledge graph competitors from SerpAPI
 */
function processKnowledgeGraphCompetitors(competitors) {
  if (!Array.isArray(competitors)) {
    return [];
  }
  
  return competitors.map(comp => {
    // Generate realistic ratings between 3.5 and 5.0
    const rating = (3.5 + Math.random() * 1.5).toFixed(1);
    
    // Generate realistic review counts
    const reviews = Math.floor(Math.random() * 200) + 20;
    
    return {
      name: comp.name,
      website: comp.link,
      rating: parseFloat(rating),
      reviews: reviews,
      isEstimated: true // Rating/reviews are estimated since they're not provided in knowledge graph
    };
  });
}

/**
 * Process businesses from search results if local results aren't available
 */
function extractBusinessesFromResponse(responseData) {
  const results = [];
  
  // Try to extract from organic results first
  if (responseData.organic_results) {
    const organicBusinesses = processOrganicResults(responseData.organic_results);
    if (organicBusinesses.length > 0) {
      results.push(...organicBusinesses);
    }
  }
  
  // If we don't have enough, try to extract business names from titles
  if (results.length < 3 && responseData.organic_results) {
    const titles = responseData.organic_results.map(result => result.title);
    
    for (const title of titles) {
      // Skip already found businesses
      if (results.some(b => b.name === title)) continue;
      
      // Skip titles that are clearly not business names
      if (title.includes('Wikipedia') || 
          title.includes('Definition') || 
          title.includes('What is') ||
          title.includes('How to')) {
        continue;
      }
      
      // Clean up title (remove anything after hyphen, pipe, or colon)
      let name = title.split(/[-|:]/)[0].trim();
      
      // Remove common suffixes that aren't part of business names
      name = name.replace(/\s+(Inc\.?|LLC|Ltd\.?|Corporation|Corp\.?|Company|Co\.?)$/i, '');
      
      // Add as a business with estimated metrics
      results.push({
        name: name,
        website: `https://www.google.com/search?q=${encodeURIComponent(name)}`,
        rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
        reviews: Math.floor(Math.random() * 200) + 20,
        isEstimated: true
      });
      
      // Once we have 3, we can stop
      if (results.length >= 3) break;
    }
  }
  
  return results;
}

/**
 * Normalize category for search
 */
function normalizeCategory(category) {
  if (!category) return 'business';
  
  // Map our internal categories to broader search terms
  const categoryMap = {
    'Restaurant': 'restaurants',
    'Cafe': 'cafes coffee shops',
    'Accommodation': 'hotels resorts',
    'Hotel': 'hotels',
    'Resort': 'resorts',
    'Lodging': 'hotels lodging',
    'Retail': 'retail shops',
    'Shopping Mall': 'shopping malls',
    'Grocery Store': 'grocery stores supermarkets',
    'Healthcare': 'hospitals healthcare clinics',
    'Medical': 'hospitals healthcare clinics',
    'Education': 'schools education',
    'Place Of Worship': 'religious organizations',
    'Financial Services': 'banks financial services',
    'Financial': 'banks financial services',
    'Beauty Services': 'beauty salons spas',
    'Beauty': 'beauty salons spas',
    'Fitness': 'gyms fitness centers',
    'Real Estate': 'real estate agencies',
    'Transport': 'transportation services',
    'Locality': 'local businesses',
    'Business': 'businesses'
  };
  
  return categoryMap[category] || category;
}

/**
 * Generate mock competitors based on business name, location, and category
 */
function generateMockCompetitors(businessName, location, category) {
  // Extract location information - use provided location from URL if available
  const locationInfo = location || extractLocationFromName(businessName);
  
  // Determine business category if not provided
  const businessCategory = category || determineCategory(businessName);
  
  // Check if this is an accommodation business
  const isAccommodation = 
    businessCategory === 'Accommodation' || 
    businessCategory === 'Hotel' || 
    businessCategory === 'Resort' || 
    businessCategory === 'Lodging' ||
    businessName.toLowerCase().includes('resort') ||
    businessName.toLowerCase().includes('hotel') ||
    businessName.toLowerCase().includes('villa') ||
    businessName.toLowerCase().includes('lodge');
  
  // Generate competitor names based on the business category
  const competitors = [];
  
  if (isAccommodation) {
    // For accommodation businesses, use more realistic hotel/resort names
    
    // Determine type of accommodation
    let accommodationType = 'Hotel';
    if (businessName.toLowerCase().includes('resort')) {
      accommodationType = 'Resort';
    } else if (businessName.toLowerCase().includes('villa')) {
      accommodationType = 'Villa';
    } else if (businessName.toLowerCase().includes('lodge')) {
      accommodationType = 'Lodge';
    }
    
    // Prefixes for accommodation businesses
    const prefixes = ['Royal', 'Grand', 'Golden', 'Luxury', 'Premium', 'Elite', 'Ocean', 'Mountain', 'Palm', 'Sunset'];
    
    // Location-based names
    const locationNames = ['Paradise', 'Oasis', 'Retreat', 'Gateway', 'Haven', 'Sanctuary', 'Escape'];
    
    // Create 3 competitors
    for (let i = 0; i < 3; i++) {
      let name;
      if (i === 0) {
        // First competitor: Prefix + Accommodation Type (e.g., "Royal Resort")
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        name = `${prefix} ${accommodationType}`;
      } else if (i === 1) {
        // Second competitor: Location-based name + Accommodation Type (e.g., "Paradise Resort")
        const locName = locationNames[Math.floor(Math.random() * locationNames.length)];
        name = `${locName} ${accommodationType}`;
      } else {
        // Third competitor: Use location in name if available
        if (locationInfo) {
          const locationParts = locationInfo.split(/[\s,]+/);
          const locationPart = locationParts[0]; // Use first part of location
          name = `${locationPart} ${accommodationType}`;
        } else {
          // Fallback to another prefix + type
          const prefix = prefixes[(Math.floor(Math.random() * prefixes.length) + 3) % prefixes.length];
          name = `${prefix} ${accommodationType}`;
        }
      }
      
      // Avoid duplicates
      while (competitors.some(c => c.name === name)) {
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        name = `${prefix} ${accommodationType}`;
      }
      
      // Create website from name
      const websiteName = name
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '')
        .toLowerCase();
      
      const tlds = ['.com', '.net', '.co.in', '.in'];
      const tld = tlds[Math.floor(Math.random() * tlds.length)];
      const website = `https://www.${websiteName}${tld}`;
      
      // Generate rating - accommodation businesses typically range 3.7-4.8
      const rating = (3.7 + Math.random() * 1.1).toFixed(1);
      
      // Generate reviews count - more for accommodations
      const reviews = Math.floor(Math.random() * 300) + 50;
      
      // Generate address
      let address;
      if (locationInfo) {
        address = `${Math.floor(Math.random() * 200) + 1}, ${locationInfo}`;
      } else {
        address = `${Math.floor(Math.random() * 200) + 1}, Tourism Area`;
      }
      
      competitors.push({
        name,
        website,
        rating: parseFloat(rating),
        reviews,
        address,
        category: accommodationType,
        isEstimated: true
      });
    }
  } else {
    // For non-accommodation businesses, use the original approach
    
    // Company name templates
    const companyTemplates = [
      `${businessCategory} Solutions`,
      `Premium ${businessCategory}`,
      `${businessCategory} Experts`,
      `${businessCategory} Pro`,
      `Elite ${businessCategory}`,
      `${businessCategory} Masters`,
      `Top ${businessCategory}`,
      `${businessCategory} Plus`,
      `${businessCategory} Group`,
      `${businessCategory} Associates`
    ];
    
    // Company suffixes
    const companySuffixes = ['Inc.', 'LLC', 'Ltd.', 'Group', 'Services', 'Company', '& Co.', 'Corporation'];
    
    // Create 3 competitors
    for (let i = 0; i < 3; i++) {
      // Generate a unique name
      let templateIndex = Math.floor(Math.random() * companyTemplates.length);
      let suffixIndex = Math.floor(Math.random() * companySuffixes.length);
      
      // Avoid duplicates
      while (competitors.some(c => c.name.includes(companyTemplates[templateIndex]))) {
        templateIndex = (templateIndex + 1) % companyTemplates.length;
      }
      
      const name = `${companyTemplates[templateIndex]} ${companySuffixes[suffixIndex]}`;
      
      // Create website from name
      const websiteName = name
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '')
        .toLowerCase();
      
      const tlds = ['.com', '.net', '.org', '.co.in', '.in'];
      const tld = tlds[Math.floor(Math.random() * tlds.length)];
      const website = `https://www.${websiteName}${tld}`;
      
      // Generate rating slightly different from previous competitors
      let rating = (3.5 + Math.random() * 1.4).toFixed(1);
      while (competitors.some(c => c.rating === rating)) {
        rating = (3.5 + Math.random() * 1.4).toFixed(1);
      }
      
      // Generate reviews count
      const reviews = Math.floor(Math.random() * 200) + 20;
      
      // Generate address
      const streets = ['Market St', 'Main St', 'Commerce Ave', 'Business Park', 'Enterprise Dr'];
      const street = streets[Math.floor(Math.random() * streets.length)];
      const streetNumber = Math.floor(Math.random() * 500) + 100;
      const address = locationInfo ? `${streetNumber} ${street}, ${locationInfo}` : `${streetNumber} ${street}`;
      
      competitors.push({
        name,
        website,
        rating: parseFloat(rating),
        reviews,
        address,
        isEstimated: true // Flag to indicate this is mock data
      });
    }
  }
  
  // Sort by rating descending
  return competitors.sort((a, b) => b.rating - a.rating);
}

/**
 * Extract location from business name
 */
function extractLocationFromName(businessName) {
  // Try to find a location in the business name (e.g., "Acme, New York")
  const parts = businessName.split(',');
  
  if (parts.length > 1) {
    return parts[1].trim();
  }
  
  return null;
}

/**
 * Determine business category based on name
 */
function determineCategory(businessName) {
  const lowerName = businessName.toLowerCase();
  
  // Map of keywords to categories
  const categoryMap = {
    'restaurant': 'Restaurant',
    'cafe': 'Cafe',
    'hotel': 'Accommodation',
    'resort': 'Accommodation',
    'villa': 'Accommodation',
    'lodge': 'Accommodation',
    'inn': 'Accommodation',
    'motel': 'Accommodation',
    'guesthouse': 'Accommodation',
    'guest house': 'Accommodation', 
    'shop': 'Retail',
    'store': 'Retail',
    'mall': 'Shopping Mall',
    'hospital': 'Medical',
    'clinic': 'Medical',
    'school': 'Education',
    'college': 'Education',
    'university': 'Education',
    'temple': 'Place Of Worship',
    'church': 'Place Of Worship',
    'mosque': 'Place Of Worship',
    'bank': 'Financial',
    'market': 'Retail',
    'salon': 'Beauty',
    'spa': 'Beauty',
    'gym': 'Fitness'
  };
  
  // Look for keywords in the business name
  for (const [keyword, category] of Object.entries(categoryMap)) {
    if (lowerName.includes(keyword)) {
      return category;
    }
  }
  
  // Return default category
  return 'Business';
}