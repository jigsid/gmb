// Test script for the GMB API implementation with fallback
const axios = require('axios');
require('dotenv').config({ path: '../../../.env' });

// Test URL - a restaurant on Google Maps
const testGoogleMapsUrl = "https://www.google.com/maps/place/The+Cheesecake+Factory/@33.9798038,-118.3993465,15z/data=!4m6!3m5!1s0x80c2b03fe6a94e3f:0x74a2a0c9ed765dfb!8m2!3d33.9798038!4d-118.3993465!16s%2Fm%2F0hr6l1v?entry=ttu";

// Extract data from the URL
function extractDataFromUrl(url) {
  try {
    // Extract place name
    const placePattern = /\/place\/([^/@]+)/;
    const placeMatch = url.match(placePattern);
    
    // Extract coordinates
    const locationPattern = /@([-\d.]+),([-\d.]+)/;
    const locationMatch = url.match(locationPattern);
    
    // Extract place ID if available
    const placeIdPattern = /0x[0-9a-fA-F]+:0x([a-fA-F0-9]+)/;
    const placeIdMatch = url.match(placeIdPattern);
    
    if (!placeMatch && !locationMatch) {
      return {
        success: false,
        error: 'Could not extract business information from the URL'
      };
    }
    
    let businessName = 'Unknown Business';
    let coordinates = { lat: 0, lng: 0 };
    let placeId = null;
    
    // Get business name
    if (placeMatch && placeMatch[1]) {
      businessName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
    }
    
    // Get coordinates
    if (locationMatch && locationMatch[1] && locationMatch[2]) {
      coordinates = {
        lat: parseFloat(locationMatch[1]),
        lng: parseFloat(locationMatch[2])
      };
    }
    
    // Get place ID
    if (placeIdMatch && placeIdMatch[0]) {
      placeId = placeIdMatch[0];
    }
    
    return {
      success: true,
      data: {
        name: businessName,
        placeId: placeId,
        coordinates: coordinates
      }
    };
  } catch (error) {
    console.error('Error extracting data from URL:', error);
    return {
      success: false,
      error: 'Failed to extract business data from URL'
    };
  }
}

// Generate mock business data
function generateMockBusinessData(extractedData) {
  console.log('Generating mock data for:', extractedData.name);
  
  // Create a realistic address
  const address = `123 Main Street, Los Angeles, CA`;
  
  // Generate reasonable category based on name
  const category = 'Restaurant';
  
  // Generate realistic ratings and reviews
  const rating = 4.5;
  const reviews = 253;
  
  // Generate website based on business name
  const website = `https://www.${extractedData.name.toLowerCase().replace(/\s+/g, '')}.com`;
  
  return {
    name: extractedData.name,
    website: website,
    rating: rating,
    reviews: reviews,
    category: category,
    address: address,
    phoneNumber: '+1 (800) 555-1234',
    location: 'Los Angeles',
    placeId: extractedData.placeId || 'mock_12345',
    isEstimated: true // Flag to indicate this is mock data
  };
}

// Test implementation
async function testGmbAPI() {
  console.log('Testing GMB API with URL:', testGoogleMapsUrl);
  
  // Extract data from URL
  const dataFromUrl = extractDataFromUrl(testGoogleMapsUrl);
  
  if (!dataFromUrl.success) {
    console.error('Could not extract data from URL:', dataFromUrl.error);
    return;
  }
  
  console.log('Extracted data:', dataFromUrl.data);
  
  // Try to use Google Places API
  let businessData;
  let isApiSuccess = false;
  
  if (process.env.GOOGLE_PLACES_API_KEY) {
    try {
      console.log('Attempting to use Google Places API...');
      // API call would go here
      
      // Simulating API failure for this test
      throw new Error('API not enabled');
    } catch (apiError) {
      console.error('Places API error:', apiError.message);
      console.log('Falling back to mock data...');
    }
  } else {
    console.log('No API key found, using mock data');
  }
  
  // Generate mock data
  businessData = generateMockBusinessData(dataFromUrl.data);
  
  console.log('Final business data:');
  console.log(JSON.stringify(businessData, null, 2));
}

// Run the test
testGmbAPI()
  .then(() => console.log('Test completed'))
  .catch(err => console.error('Test failed:', err));

