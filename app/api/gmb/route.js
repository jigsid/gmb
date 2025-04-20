import { NextResponse } from 'next/server';
import axios from 'axios';

// Simple in-memory cache for API responses
const cache = {
  places: new Map(),
  getPlaceDetails: (placeId) => cache.places.get(placeId),
  setPlaceDetails: (placeId, data, ttl = 3600000) => { // 1 hour TTL by default
    cache.places.set(placeId, {
      data,
      expiry: Date.now() + ttl
    });
  },
  isExpired: (placeId) => {
    const entry = cache.places.get(placeId);
    return !entry || entry.expiry < Date.now();
  }
};

// Get API key from environment variable
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

export async function POST(request) {
  try {
    const { profileUrl } = await request.json();
    
    if (!profileUrl) {
      return NextResponse.json(
        { error: 'Google Maps URL is required' },
        { status: 400 }
      );
    }

    console.log('Processing URL:', profileUrl);

    // Extract data from URL
    const dataFromUrl = extractDataFromUrl(profileUrl);
    
    if (!dataFromUrl.success) {
      return NextResponse.json(
        { error: dataFromUrl.error },
        { status: 400 }
      );
    }

    let businessData;
    let isApiSuccess = false;
    
    // Try to use the Google Places API first
    if (GOOGLE_PLACES_API_KEY) {
      try {
        const placeDetails = await fetchBusinessDetailsFromPlacesApi(dataFromUrl.data);
        
        if (placeDetails.success) {
          businessData = placeDetails.data;
          isApiSuccess = true;
        }
      } catch (apiError) {
        console.error('Places API error:', apiError.message || apiError);
        // We'll fall back to the mock data below
      }
    }
    
    // Fall back to mock data if API failed or no API key
    if (!isApiSuccess) {
      businessData = generateMockBusinessData(dataFromUrl.data);
      console.log('Using mock data fallback');
    }

    console.log('Business data:', businessData);

    // Return the response
    return NextResponse.json(businessData);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business data: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}

/**
 * Extract data from Google Maps URL
 */
function extractDataFromUrl(url) {
  try {
    // For more reliable extraction, decode the URL first
    const decodedUrl = decodeURIComponent(url);
    
    // Extract place name
    const placePattern = /\/place\/([^/@]+)/;
    const placeMatch = decodedUrl.match(placePattern);
    
    // Extract coordinates
    const locationPattern = /@([-\d.]+),([-\d.]+)/;
    const locationMatch = decodedUrl.match(locationPattern);
    
    // Extract place ID - various formats
    // Format 1: 0x[hex]:0x[hex]
    const placeIdPattern = /0x[0-9a-fA-F]+:0x[0-9a-fA-F]+/;
    const placeIdMatch = decodedUrl.match(placeIdPattern);
    
    // Format 2: placeid=[alphanumeric]
    const placeIdQueryPattern = /[?&]placeid=([^&]+)/;
    const placeIdQueryMatch = decodedUrl.match(placeIdQueryPattern);
    
    // Format 3: CID extraction (Client ID) 
    const cidPattern = /[?&]cid=(\d+)/;
    const cidMatch = decodedUrl.match(cidPattern);

    // Format 4: Maps URL with /maps?q= format
    const mapsQPattern = /maps\?q=([^&]+)/;
    const mapsQMatch = decodedUrl.match(mapsQPattern);
    
    // Additional business name extraction from query format
    const queryNamePattern = /[?&]q=([^&]+)/;
    const queryNameMatch = decodedUrl.match(queryNamePattern);
    
    // Format 5: Extract website URL from GMB URL if available
    const websitePattern = /[?&]website=([^&]+)/;
    const websiteMatch = decodedUrl.match(websitePattern);
    
    // Format 6: Try to extract number of reviews from URL - multiple patterns with priority
    // Pattern 1: Exact review count pattern (4.3 stars · 421 reviews)
    const reviewsPattern1 = /(\d[\d,]*)\s+reviews?/i;
    // Pattern 2: Sometimes embedded in data (e.g., user_ratings_total=421)
    const reviewsPattern2 = /user_ratings_total=(\d+)/i;
    // Pattern 3: Sometimes in JSON-like data with quotes
    const reviewsPattern3 = /"user_ratings_total"\s*:\s*(\d+)/i;
    // Pattern 4: Reviews count may be in a data attribute 
    const reviewsPattern4 = /data-rating-count="(\d+)"/i;
    // Pattern 5: Reviews count may be in a data element
    const reviewsPattern5 = /data-reviews-count="(\d+)"/i;
    
    // Format 7: Try to extract location information from URL with multiple patterns
    // Pattern 1: City after business name with +
    const locationPattern1 = /place\/[^/]+\+([^/,+]+)/i;
    // Pattern 2: City, State format
    const locationPattern2 = /\/([A-Z][a-zA-Z\s]+?),\+([A-Z][a-zA-Z\s]+?)\//;
    // Pattern 3: Look for location in URL path segments
    const locationPattern3 = /\/maps\/place\/[^/]+\/([^/]+)/;
    // Pattern 4: Location may be in address component
    const locationPattern4 = /address=([^&,]+)/i;
    
    // Always try to extract reviews regardless of URL keywords
    let reviewsMatch = null;
    const allReviewsPatterns = [reviewsPattern1, reviewsPattern2, reviewsPattern3, reviewsPattern4, reviewsPattern5];
    for (const pattern of allReviewsPatterns) {
      const match = decodedUrl.match(pattern);
      if (match && match[1]) {
        reviewsMatch = match;
        console.log(`Found reviews using pattern: ${pattern}`, reviewsMatch[1]);
        break; // Stop at first successful match
      }
    }
    
    // Try to match location patterns
    const locationMatch1 = decodedUrl.match(locationPattern1);
    const locationMatch2 = decodedUrl.match(locationPattern2);
    const locationMatch3 = decodedUrl.match(locationPattern3);
    const locationMatch4 = decodedUrl.match(locationPattern4);
    
    if (!placeMatch && !locationMatch && !placeIdMatch && !placeIdQueryMatch && !cidMatch && !mapsQMatch && !queryNameMatch) {
      return {
        success: false,
        error: 'Could not extract business information from the URL. Please ensure you are using a Google Maps URL for a business.'
      };
    }
    
    let businessName = 'Unknown Business';
    let coordinates = { lat: 0, lng: 0 };
    let placeId = null;
    let website = null;
    let reviewsCount = null;
    let locationFromUrl = null;
    
    // Get business name - first try place match
    if (placeMatch && placeMatch[1]) {
      businessName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
      
      // Sometimes location is part of the business name (e.g., "Business+Name+City")
      const nameParts = businessName.split(' ');
      if (nameParts.length >= 3) {
        // If the last part looks like a location (capitalized, not a common business word)
        const lastPart = nameParts[nameParts.length - 1];
        const commonBusinessWords = ['inc', 'llc', 'ltd', 'co', 'company', 'corporation', 'enterprises', 'services'];
        if (/^[A-Z]/.test(lastPart) && !commonBusinessWords.includes(lastPart.toLowerCase())) {
          locationFromUrl = lastPart;
          console.log('Possible location extracted from business name:', locationFromUrl);
        }
      }
    } 
    // If no place match, try from query name
    else if (queryNameMatch && queryNameMatch[1]) {
      businessName = decodeURIComponent(queryNameMatch[1].replace(/\+/g, ' '));
    }
    // If maps?q= format is used
    else if (mapsQMatch && mapsQMatch[1]) {
      businessName = decodeURIComponent(mapsQMatch[1].replace(/\+/g, ' '));
    }
    
    // Get location from URL patterns if available
    if (locationMatch2 && locationMatch2[1] && locationMatch2[2]) {
      // We have a City, State pattern
      locationFromUrl = locationMatch2[1].replace(/\+/g, ' ');
      console.log('Location extracted from URL (City, State pattern):', locationFromUrl);
    } else if (locationMatch1 && locationMatch1[1]) {
      // We have a location after business name
      locationFromUrl = locationMatch1[1].replace(/\+/g, ' ');
      console.log('Location extracted from URL (after business):', locationFromUrl);
    } else if (locationMatch3 && locationMatch3[1]) {
      // Location from the URL path segment
      locationFromUrl = locationMatch3[1].replace(/\+/g, ' ');
      console.log('Location extracted from URL path segment:', locationFromUrl);
    } else if (locationMatch4 && locationMatch4[1]) {
      // Location from address parameter
      locationFromUrl = locationMatch4[1].replace(/\+/g, ' ');
      console.log('Location extracted from address parameter:', locationFromUrl);
    }
    
    // Get coordinates
    if (locationMatch && locationMatch[1] && locationMatch[2]) {
      coordinates = {
        lat: parseFloat(locationMatch[1]),
        lng: parseFloat(locationMatch[2])
      };
    }
    
    // Get place ID with preference order: placeid param > direct placeId > CID
    if (placeIdQueryMatch && placeIdQueryMatch[1]) {
      placeId = placeIdQueryMatch[1];
      console.log('Extracted Place ID (from placeid parameter):', placeId);
    } else if (placeIdMatch && placeIdMatch[0]) {
      placeId = placeIdMatch[0];
      console.log('Extracted Place ID (hex format):', placeId);
    } else if (cidMatch && cidMatch[1]) {
      placeId = cidMatch[1];
      console.log('Extracted Place ID (from CID):', placeId);
    }
    
    // Get website if available directly in the URL
    if (websiteMatch && websiteMatch[1]) {
      website = decodeURIComponent(websiteMatch[1]);
      if (!website.startsWith('http')) {
        website = 'https://' + website;
      }
      console.log('Extracted website URL:', website);
    }
    
    // Get reviews count if available in the URL
    if (reviewsMatch && reviewsMatch[1]) {
      // Remove commas and convert to number
      reviewsCount = parseInt(reviewsMatch[1].replace(/,/g, ''), 10);
      console.log('Extracted reviews count from URL:', reviewsCount);
    } else {
      // Try to find review count in the entire URL as a last resort
      const fullUrlReviewMatch = decodedUrl.match(/(\d+)\s*reviews?/i);
      if (fullUrlReviewMatch && fullUrlReviewMatch[1]) {
        reviewsCount = parseInt(fullUrlReviewMatch[1], 10);
        console.log('Extracted reviews count from full URL text:', reviewsCount);
      }
    }
    
    // Try to extract review count from the last part of the URL
    if (!reviewsCount) {
      const urlParts = decodedUrl.split('/');
      const lastPart = urlParts[urlParts.length - 1];
      const reviewCountMatch = lastPart.match(/(\d+)\s*reviews?/i);
      
      if (reviewCountMatch && reviewCountMatch[1]) {
        reviewsCount = parseInt(reviewCountMatch[1], 10);
        console.log('Extracted reviews count from last part of URL:', reviewsCount);
      }
    }
    
    // If we don't have a business name but have coordinates, we might be able to find it by reverse geocoding
    if (businessName === 'Unknown Business' && coordinates.lat !== 0 && coordinates.lng !== 0) {
      console.log('No business name found, but coordinates are available. Will search by location.');
    }
    
    // If we have neither business name nor place ID but have coordinates,
    // we'll use coordinates for search but warn about it
    if (businessName === 'Unknown Business' && !placeId && coordinates.lat !== 0) {
      console.log('Warning: Limited information in URL. Using only coordinates to find business.');
    }
    
    // Clean up extracted location if it's not meaningful
    if (locationFromUrl) {
      // Check if location is just numbers or special characters
      if (/^[\d\s,.]+$/.test(locationFromUrl) || locationFromUrl.length < 2) {
        console.log('Extracted location appears invalid, discarding:', locationFromUrl);
        locationFromUrl = null;
      }
    }
    
    console.log('Extraction complete, found data:', {
      businessName, 
      placeId, 
      reviewsCount,
      locationFromUrl
    });
    
    return {
      success: true,
      data: {
        name: businessName,
        placeId: placeId,
        coordinates: coordinates,
        website: website,  // Include the website if found in the URL
        reviews: reviewsCount,  // Include reviews count if found in the URL
        location: locationFromUrl // Include location if found in the URL
      }
    };
  } catch (error) {
    console.error('Error extracting data from URL:', error);
    return {
      success: false,
      error: 'Failed to extract business data from URL. Please try a different Google Maps URL.'
    };
  }
}

/**
 * Search for a place by name and optional coordinates
 * @param {string} query - Business name to search for
 * @param {Object} coordinates - { lat, lng } coordinates to center search around
 * @returns {Promise<Array>} - Array of search results
 */
async function searchNearbyPlace(query, coordinates) {
  console.log(`Searching for place: "${query}" near coordinates:`, coordinates);
  const googleApiKey = process.env.GOOGLE_PLACES_API_KEY;
  
  if (!googleApiKey) {
    throw new Error('Google Places API key is missing');
  }

  let url;
  const hasValidCoordinates = coordinates && 
                             coordinates.lat && 
                             coordinates.lng && 
                             !isNaN(coordinates.lat) && 
                             !isNaN(coordinates.lng);
  
  // If we have a valid query, do a standard text search
  if (query && query !== 'Unknown Business') {
    // Build the request URL for text search
    url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${googleApiKey}`;
    
    // Add location biasing if coordinates are provided
    if (hasValidCoordinates) {
      url += `&location=${coordinates.lat},${coordinates.lng}&radius=5000`;
    }
  }
  // If we only have coordinates, do a nearby search instead
  else if (hasValidCoordinates) {
    console.log('No business name provided, searching for nearby places based on coordinates');
    // Use nearby search API instead of text search
    url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coordinates.lat},${coordinates.lng}&radius=500&key=${googleApiKey}`;
    
    // Try to find prominent places like hotels, restaurants, etc. first
    url += '&rankby=prominence&type=lodging,restaurant,tourist_attraction';
  } else {
    throw new Error('Insufficient search parameters: need either business name or valid coordinates');
  }
  
  try {
    const response = await fetch(url, { 
      method: 'GET',
      timeout: 10000 // 10 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`Google Places API Search failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check for API errors
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Places API Search error:', data.status, data.error_message);
      throw new Error(`Google Places API Search error: ${data.status} - ${data.error_message || 'Unknown error'}`);
    }
    
    if (data.status === 'ZERO_RESULTS') {
      console.log(`No results found for "${query || 'nearby places'}" at coordinates`);
      return [];
    }
    
    console.log(`Found ${data.results.length} results for "${query || 'nearby places'}"`);
    return data.results;
  } catch (error) {
    console.error('Error searching for place:', error.message);
    throw error;
  }
}

/**
 * Fetch business details from Google Places API
 */
async function fetchBusinessDetailsFromPlacesApi(extractedData) {
  try {
    let placeDetails = null;
    let searchResults = [];
    let searchAttempts = 0;
    
    // First try: If we have a Place ID, use it directly
    if (extractedData.placeId) {
      try {
        // Check cache before making API request
        if (!cache.isExpired(extractedData.placeId)) {
          const cachedData = cache.getPlaceDetails(extractedData.placeId);
          console.log('Using cached place details for ID:', extractedData.placeId);
          placeDetails = cachedData.data;
        } else {
          placeDetails = await fetchPlaceDetails(extractedData.placeId);
          // Cache the result if successful
          if (placeDetails) {
            cache.setPlaceDetails(extractedData.placeId, placeDetails);
          }
        }
      } catch (placeIdError) {
        console.error('Error fetching by place ID, will try name search instead:', placeIdError.message);
        // We'll continue to the name search below
        placeDetails = null;
      }
    }
    
    // Second try: If place ID search failed or no place ID, search by name and location
    if (!placeDetails && extractedData.name && extractedData.name !== 'Unknown Business') {
      try {
        console.log('Falling back to name-based search for:', extractedData.name);
        searchAttempts++;
        
        // Create a cache key for name+location searches
        const cacheKey = `${extractedData.name}|${extractedData.coordinates.lat || ''},${extractedData.coordinates.lng || ''}`;
        
        // Check cache before making API request
        if (!cache.isExpired(cacheKey)) {
          const cachedData = cache.getPlaceDetails(cacheKey);
          console.log('Using cached search results for:', cacheKey);
          placeDetails = cachedData.data;
        } else {
          // If place ID search fails, try using name and location
          console.log(`Place ID search failed, trying with name and location: ${extractedData.name}`);
          searchResults = await searchNearbyPlace(extractedData.name, extractedData.coordinates);
          
          if (searchResults && searchResults.length > 0) {
            // Use the first result's place_id for the details search
            console.log(`Found place via name search, using place_id: ${searchResults[0].place_id}`);
            
            try {
              const detailsResponse = await fetch(
                `https://maps.googleapis.com/maps/api/place/details/json?place_id=${searchResults[0].place_id}&fields=name,formatted_address,formatted_phone_number,website,opening_hours,rating,geometry,types,business_status,photos,user_ratings_total,review,url&key=${GOOGLE_PLACES_API_KEY}`,
                { method: 'GET' }
              );
              
              if (!detailsResponse.ok) {
                throw new Error(`Google Places API Details search failed with status: ${detailsResponse.status}`);
              }
              
              const detailsData = await detailsResponse.json();
              
              // Check for API errors
              if (detailsData.status !== 'OK') {
                throw new Error(`Google Places API Details search error: ${detailsData.status} - ${detailsData.error_message || 'Unknown error'}`);
              }
              
              placeDetails = detailsData.result;
              
              console.log('Place details retrieved:', {
                name: placeDetails.name,
                rating: placeDetails.rating,
                user_ratings_total: placeDetails.user_ratings_total,
                hasReviews: !!placeDetails.reviews,
                reviewsCount: placeDetails.reviews ? placeDetails.reviews.length : 0
              });
              
              // Cache the result with the name-location key
              cache.setPlaceDetails(cacheKey, placeDetails);
            } catch (detailsError) {
              console.error('Error fetching details for search result:', detailsError.message);
              throw detailsError;
            }
          } else {
            throw new Error(`Could not find ${extractedData.name} using either place ID or name search`);
          }
        }
      } catch (nameSearchError) {
        console.error('Name search also failed:', nameSearchError.message);
        // Both search methods failed, will try coordinates search as last resort
      }
    }
    
    // Third try: If name search failed or no name, try using only coordinates
    if (!placeDetails && extractedData.coordinates && 
        extractedData.coordinates.lat && 
        extractedData.coordinates.lng) {
      try {
        console.log('Falling back to coordinates-only search');
        searchAttempts++;
        
        // Create a cache key for coordinates searches
        const cacheKey = `coords|${extractedData.coordinates.lat},${extractedData.coordinates.lng}`;
        
        // Check cache before making API request
        if (!cache.isExpired(cacheKey)) {
          const cachedData = cache.getPlaceDetails(cacheKey);
          console.log('Using cached coordinates search results');
          placeDetails = cachedData.data;
        } else {
          // Try to find places near these coordinates
          console.log('Searching for places near coordinates');
          searchResults = await searchNearbyPlace(null, extractedData.coordinates);
          
          if (searchResults && searchResults.length > 0) {
            // Use the first (closest) result for details
            console.log(`Found place via coordinates search, using place_id: ${searchResults[0].place_id}`);
            
            try {
              const detailsResponse = await fetch(
                `https://maps.googleapis.com/maps/api/place/details/json?place_id=${searchResults[0].place_id}&fields=name,formatted_address,formatted_phone_number,website,opening_hours,rating,geometry,types,business_status,photos,user_ratings_total,review,url&key=${GOOGLE_PLACES_API_KEY}`,
                { method: 'GET' }
              );
              
              if (!detailsResponse.ok) {
                throw new Error(`Google Places API Details search failed with status: ${detailsResponse.status}`);
              }
              
              const detailsData = await detailsResponse.json();
              
              // Check for API errors
              if (detailsData.status !== 'OK') {
                throw new Error(`Google Places API Details search error: ${detailsData.status} - ${detailsData.error_message || 'Unknown error'}`);
              }
              
              placeDetails = detailsData.result;
              
              console.log('Place details retrieved:', {
                name: placeDetails.name,
                rating: placeDetails.rating,
                user_ratings_total: placeDetails.user_ratings_total,
                hasReviews: !!placeDetails.reviews,
                reviewsCount: placeDetails.reviews ? placeDetails.reviews.length : 0
              });
              
              // Cache the result with coordinates key
              cache.setPlaceDetails(cacheKey, placeDetails);
            } catch (detailsError) {
              console.error('Error fetching details for coordinates result:', detailsError.message);
              throw detailsError;
            }
          } else {
            throw new Error('Could not find any businesses at the provided coordinates');
          }
        }
      } catch (coordsSearchError) {
        console.error('Coordinates search also failed:', coordsSearchError.message);
        // All search methods failed, will return error below
      }
    }
    
    // If we still don't have place details, return an error with detailed diagnostics
    if (!placeDetails) {
      const errorDetails = {
        hadPlaceId: Boolean(extractedData.placeId),
        hadName: Boolean(extractedData.name) && extractedData.name !== 'Unknown Business',
        hadCoordinates: Boolean(extractedData.coordinates && extractedData.coordinates.lat && extractedData.coordinates.lng),
        searchAttempts: searchAttempts,
        searchResultsLength: searchResults ? searchResults.length : 0
      };
      
      console.error('Failed to get place details from any search method. Diagnostics:', errorDetails);
      
      return {
        success: false,
        error: 'Failed to fetch place details. Please try a different Google Maps URL or check if the business exists.',
        diagnostics: errorDetails
      };
    }
    
    // Check if the name contains lodging-related terms, which helps with proper categorization
    const businessName = placeDetails.name || extractedData.name;
    const lowerName = businessName.toLowerCase();
    let category = extractPrimaryCategory(placeDetails.types);
    
    // Override category if name suggests accommodation but Google's category is different
    if ((lowerName.includes('resort') || 
         lowerName.includes('hotel') || 
         lowerName.includes('villa') ||
         lowerName.includes('lodge') ||
         lowerName.includes('inn')) && 
         category !== 'Accommodation') {
      console.log(`Adjusting category to Accommodation based on business name: ${businessName}`);
      category = 'Accommodation';
    }
    
    // Extract relevant business information
    const businessData = {
      name: businessName,
      // Use the direct website URL from extractedData if available, otherwise use the one from Places API
      website: extractedData.website || placeDetails.website || null,
      rating: placeDetails.rating || 0,
      // Use either the user_ratings_total from the API, or a count from the reviews array, or the count from URL
      // Explicitly check user_ratings_total for a number (zero is valid but falsy)
      reviews: typeof placeDetails.user_ratings_total === 'number' ? placeDetails.user_ratings_total : 
               (placeDetails.reviews ? placeDetails.reviews.length : 0) || 
               extractedData.reviews || 0,
      category: category,
      address: placeDetails.formatted_address || null,
      phoneNumber: placeDetails.formatted_phone_number || null,
      // Use location from URL extraction if available, otherwise extract from address
      location: extractedData.location || extractAreaFromAddress(placeDetails.formatted_address),
      placeId: extractedData.placeId || placeDetails.place_id,
      googleMapsUrl: placeDetails.url || null,
      isEstimated: false
    };
    
    // Log the business data for debugging
    console.log('Final business data:', {
      name: businessData.name,
      reviews: businessData.reviews,
      reviewSource: typeof placeDetails.user_ratings_total === 'number' ? 'API user_ratings_total' : 
                   (placeDetails.reviews ? 'API reviews array length' : 
                   (extractedData.reviews ? 'URL extraction' : 'unknown')),
      location: businessData.location,
      locationSource: extractedData.location ? 'URL extraction' : 'Address extraction'
    });
    
    return {
      success: true,
      data: businessData
    };
  } catch (error) {
    console.error('Error fetching business details from Places API:', error.message || error);
    
    // Enhanced error reporting
    let errorMessage = 'Failed to fetch business details';
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      errorMessage += `: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage += ': No response received from API';
    } else {
      // Something happened in setting up the request that triggered an Error
      errorMessage += `: ${error.message}`;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Generate mock business data based on extracted URL data
 */
function generateMockBusinessData(extractedData) {
  // Create a realistic address based on business name
  const address = generateAddressFromName(extractedData.name);
  
  // Generate reasonable category based on name
  const category = determineCategory(extractedData.name);
  
  // Generate realistic ratings and reviews
  const rating = (3.5 + Math.random() * 1.5).toFixed(1);
  const reviews = extractedData.reviews || (Math.floor(Math.random() * 100) + 10);
  
  // Generate website based on business name or use the one from extractedData
  const website = extractedData.website || generateWebsiteFromName(extractedData.name);
  
  // Use location from URL extraction if available, otherwise extract from generated address
  const location = extractedData.location || extractAreaFromAddress(address);
  
  return {
    name: extractedData.name,
    website: website,
    rating: parseFloat(rating),
    reviews: reviews,
    category: category,
    address: address,
    phoneNumber: generatePhoneNumber(),
    location: location,
    placeId: extractedData.placeId || 'mock_' + Math.random().toString(36).substring(2, 10),
    googleMapsUrl: null, // No direct Google Maps URL for mock data
    isEstimated: true // Flag to indicate this is mock data
  };
}

/**
 * Fetch place details from Google Places API
 */
async function fetchPlaceDetails(placeId) {
  try {
    console.log('Fetching place details for ID:', placeId);
    
    // Handle different Place ID formats
    let cleanPlaceId = placeId;
    
    // Check if this is a hex format place ID (0x format)
    const isHexFormat = /^0x[0-9a-fA-F]+:0x[0-9a-fA-F]+$/.test(placeId);
    
    if (isHexFormat) {
      // For hex format, we can't use it directly with Places API
      // Instead, we'll throw to use the search method
      console.log('Hex format Place ID cannot be used directly, falling back to search');
      throw new Error('Hex format place IDs cannot be used directly with the Places API, falling back to search');
    }
    
    // Check if this is a numeric CID - these need to be prefixed with 'ChIJ' for Places API
    if (/^\d+$/.test(placeId)) {
      console.log('Numeric CID detected, but Places API requires ChIJ-format IDs. Falling back to search.');
      throw new Error('Numeric CID format cannot be used directly with Places API, falling back to search');
    }
    
    // Check if the API key is valid
    if (!GOOGLE_PLACES_API_KEY) {
      throw new Error('No Google Places API key provided');
    }
    
    // Make the API request with proper error handling
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
      params: {
        place_id: cleanPlaceId,
        fields: 'name,rating,formatted_phone_number,formatted_address,website,user_ratings_total,reviews,types',
        key: GOOGLE_PLACES_API_KEY
      },
      timeout: 10000 // 10 second timeout
    });
    
    // Check for API errors and handle them specifically
    if (response.data.status !== 'OK') {
      console.error('Places API response status:', response.data.status);
      console.error('Places API error message:', response.data.error_message || 'No error message provided');
      throw new Error(`Places API error: ${response.data.status} - ${response.data.error_message || 'Unknown error'}`);
    }
    
    if (!response.data.result) {
      throw new Error('No result found in Places API response');
    }
    
    // Log the review information for debugging
    const result = response.data.result;
    console.log('Place details reviews info:', {
      name: result.name,
      hasUserRatingsTotal: !!result.user_ratings_total,
      userRatingsTotal: result.user_ratings_total || 'Not available',
      hasReviews: Array.isArray(result.reviews),
      reviewsCount: Array.isArray(result.reviews) ? result.reviews.length : 0
    });
    
    return response.data.result;
  } catch (error) {
    // Enhance error logging
    if (error.response) {
      // The request was made and the server responded with a status code outside of 2xx
      console.error('Places API response error:', error.response.status, error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Places API no response received:', error.request);
    }
    
    console.error('Error fetching place details:', error.message || error);
    throw error;
  }
}

/**
 * Generate a plausible address from business name
 */
function generateAddressFromName(businessName) {
  // Extract location names from the business name
  const locationNames = extractLocationNames(businessName);
  
  // Generate a random street number and name
  const streetNumber = Math.floor(Math.random() * 200) + 1;
  const streetName = generateRandomStreetName();
  
  if (locationNames.city && locationNames.state) {
    return `${streetNumber} ${streetName}, ${locationNames.city}, ${locationNames.state}${locationNames.postalCode ? ' ' + locationNames.postalCode : ''}`;
  }
  
  // Fallback to using the business name as location
  return `${streetNumber} ${streetName}, ${businessName}`;
}

/**
 * Extract location names from business name
 */
function extractLocationNames(businessName) {
  // Example: "Nakoda, Rajasthan 344024" -> city: Nakoda, state: Rajasthan, postalCode: 344024
  const parts = businessName.split(/[,\s]+/).filter(p => p.trim());
  const result = { city: null, state: null, postalCode: null };
  
  // Simple heuristic: last word might be postal code if it's numbers
  const postalCodePattern = /^\d{5,6}$/;
  for (let i = parts.length - 1; i >= 0; i--) {
    if (postalCodePattern.test(parts[i])) {
      result.postalCode = parts[i];
      parts.splice(i, 1);
      break;
    }
  }
  
  // If we have at least two parts left, assume the last is state and second-to-last is city
  if (parts.length >= 2) {
    result.state = parts[parts.length - 1];
    result.city = parts[parts.length - 2];
  } else if (parts.length === 1) {
    result.city = parts[0];
  }
  
  return result;
}

/**
 * Generate a random street name
 */
function generateRandomStreetName() {
  const prefixes = ['Main', 'Park', 'Oak', 'Pine', 'Maple', 'Cedar', 'Hill', 'Lake', 'River', 'Market'];
  const suffixes = ['Street', 'Avenue', 'Road', 'Boulevard', 'Lane', 'Drive', 'Way', 'Place', 'Court'];
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  return `${prefix} ${suffix}`;
}

/**
 * Generate website URL from business name
 */
function generateWebsiteFromName(businessName) {
  // Clean up business name for domain
  const domain = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 15);
  
  // Common TLDs
  const tlds = ['.com', '.co.in', '.in', '.net', '.org'];
  const tld = tlds[Math.floor(Math.random() * tlds.length)];
  
  return `https://www.${domain}${tld}`;
}

/**
 * Generate random phone number
 */
function generatePhoneNumber() {
  // Generate Indian-style phone number
  return '+91 ' + Math.floor(Math.random() * 9000000000 + 1000000000);
}

/**
 * Extract primary business category from Google Places types
 */
function extractPrimaryCategory(types) {
  if (!types || types.length === 0) {
    return 'Business';
  }
  
  // First check if business name indicates a resort or lodging
  // This will be used in combination with Google Places types
  
  // Map of Google Places types to user-friendly categories
  const categoryMap = {
    'restaurant': 'Restaurant',
    'food': 'Restaurant',
    'cafe': 'Cafe',
    'bar': 'Bar',
    'lodging': 'Accommodation',
    'hotel': 'Accommodation',
    'resort': 'Accommodation',
    'campground': 'Accommodation',
    'guest_house': 'Accommodation',
    'store': 'Retail',
    'shopping_mall': 'Shopping Mall',
    'grocery_or_supermarket': 'Grocery Store',
    'supermarket': 'Grocery Store',
    'hospital': 'Healthcare',
    'health': 'Healthcare',
    'doctor': 'Healthcare',
    'school': 'Education',
    'university': 'Education',
    'place_of_worship': 'Religious Organization',
    'bank': 'Financial Services',
    'beauty_salon': 'Beauty Services',
    'hair_care': 'Beauty Services',
    'gym': 'Fitness',
    'real_estate_agency': 'Real Estate',
    'local_government_office': 'Government',
    'lawyer': 'Legal Services',
    'accounting': 'Financial Services',
    'electronics_store': 'Electronics',
    'clothing_store': 'Clothing',
    'furniture_store': 'Furniture',
    'home_goods_store': 'Home Goods',
    'hardware_store': 'Hardware Store',
    'car_dealer': 'Automotive',
    'car_repair': 'Automotive',
    'gas_station': 'Gas Station',
    'parking': 'Parking',
    'post_office': 'Postal Service',
    'airport': 'Transportation',
    'train_station': 'Transportation',
    'bus_station': 'Transportation',
    'travel_agency': 'Travel',
    'tourist_attraction': 'Tourism',
    'amusement_park': 'Entertainment',
    'movie_theater': 'Entertainment',
    'art_gallery': 'Art',
    'museum': 'Museum',
    'park': 'Park',
    'library': 'Library',
    'pharmacy': 'Pharmacy',
    'insurance_agency': 'Insurance',
    'pet_store': 'Pet Services',
    'veterinary_care': 'Pet Services',
    'dentist': 'Dental Care',
    'physiotherapist': 'Healthcare'
  };
  
  // Check if the name of the business contains resort/hotel/etc.
  // This will be done in the fetchBusinessDetailsFromPlacesApi function
  
  // Check if any of our mapped categories match the place types
  for (const type of types) {
    if (categoryMap[type]) {
      return categoryMap[type];
    }
  }
  
  // Convert first type to title case as fallback
  if (types[0]) {
    return types[0]
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  return 'Business';
}

/**
 * Determine business category based on name (for mock data)
 */
function determineCategory(businessName) {
  const lowerName = businessName.toLowerCase();
  
  // Map of keywords to categories
  const categoryMap = {
    'restaurant': 'Restaurant',
    'cafe': 'Cafe',
    'hotel': 'Hotel',
    'lodge': 'Lodging',
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
    'park': 'Park',
    'garden': 'Park',
    'market': 'Shopping',
    'bank': 'Financial Services',
    'station': 'Transport',
    'airport': 'Transport'
  };
  
  // Look for keywords in the business name
  for (const [keyword, category] of Object.entries(categoryMap)) {
    if (lowerName.includes(keyword)) {
      return category;
    }
  }
  
  // Check if it's a location/city
  if (lowerName.includes('city') || lowerName.includes('town') || lowerName.includes('village')) {
    return 'Locality';
  }
  
  // Return default category
  return 'Business';
}

/**
 * Extract area name from address
 */
function extractAreaFromAddress(address) {
  if (!address) return null;
  
  // Log the address for debugging
  console.log('Extracting area from address:', address);
  
  // Split address into parts
  const parts = address.split(',').map(part => part.trim());
  
  // First check if the address appears to be Indian format (town, district, state, pincode)
  // Example: "Hotel Tulsi Inn, 89/2, Sector 53, Near Medanta the Medicity, Golf Course Road, Gurugram, Haryana 122002, India"
  if (parts.length >= 4 && parts[parts.length - 1].trim() === 'India') {
    // Second to last part usually contains the state and postal code
    const stateWithPincode = parts[parts.length - 2].trim();
    // Part before that is usually the city/district
    const cityDistrictPart = parts[parts.length - 3].trim();
    
    // Extract just the city name, not any numbers
    const cityMatch = cityDistrictPart.match(/([A-Za-z\s]+)/);
    if (cityMatch && cityMatch[1].trim().length > 2) {
      const city = cityMatch[1].trim();
      console.log('Found city using Indian address format:', city);
      return city;
    }
  }
  
  // If not Indian format or couldn't find city, continue with general approach
  if (parts.length >= 3) {
    // For addresses with 3+ parts, the city is usually second-to-last or third-to-last
    // Exclude the country (last part) and try to get the city
    
    // Check if second-to-last part contains postal code, which would indicate it's the state/region part
    const secondToLast = parts[parts.length - 2];
    const hasPostalCode = /\d{4,}/.test(secondToLast); // Check for 4+ digits as postal code
    
    if (hasPostalCode && parts.length >= 4) {
      // If second-to-last has postal code and we have 4+ parts, city is likely third-to-last
      const cityPart = parts[parts.length - 3];
      console.log('Found city in third-to-last part:', cityPart);
      return cityPart;
    } else {
      // Otherwise, city is likely in the second-to-last part (possibly before the postal code)
      // Try to extract just the city by removing postal code if present
      const cityPart = secondToLast.replace(/\s+\d{4,}.*$/, '');
      console.log('Found city in second-to-last part:', cityPart);
      return cityPart;
    }
  } else if (parts.length === 2) {
    // For 2-part addresses, the first part is likely the street and the second part contains the city
    // Try to extract city from the second part by removing postal code if present
    const cityPart = parts[1].replace(/\s+\d{4,}.*$/, '');
    console.log('Found city in second part of 2-part address:', cityPart);
    return cityPart;
  }
  
  // Fallback: Try to find city name directly in any part of the address
  // Look for common city patterns - words with first letter capitalized not followed by numbers
  for (const part of parts) {
    const cityPattern = /([A-Z][a-zA-Z\s]+?)(?=\s+\d|\s*,|$)/;
    const cityMatch = part.match(cityPattern);
    if (cityMatch && cityMatch[1].length > 2) {
      console.log('Found city using pattern match:', cityMatch[1]);
      return cityMatch[1].trim();
    }
  }
  
  // Special case: If we have any part that looks like a well-formed city name
  for (const part of parts) {
    // Look for a part that:
    // 1. Doesn't have numbers
    // 2. Isn't too short
    // 3. Has capital letters (proper noun)
    if (!/\d/.test(part) && part.length > 3 && /[A-Z]/.test(part)) {
      console.log('Found potential city from clean part:', part);
      return part;
    }
  }
  
  // Last resort fallback: return first part
  console.log('Fallback to first part:', parts[0]);
  return parts[0];
}