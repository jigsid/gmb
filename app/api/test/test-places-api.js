// Test script for the Google Places API
const axios = require('axios');
require('dotenv').config({ path: '../../../.env' });

// Get API key from environment variable
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

// Test data - a sample Google Maps URL
const testGmbUrl = "https://www.google.com/maps/place/Taj+Palace,+New+Delhi/@28.5994918,77.1718511,17z/data=!3m1!4b1!4m9!3m8!1s0x390d1da3d72a6cbd:0x85f7356de22da47c!5m2!4m1!1i2!8m2!3d28.5994871!4d77.174426!16s%2Fm%2F04sv7_r?entry=ttu";

/**
 * Extract data from Google Maps URL
 */
function extractDataFromUrl(url) {
  try {
    // Extract place name
    const placePattern = /\/place\/([^/@]+)/;
    const placeMatch = url.match(placePattern);
    
    // Extract coordinates
    const locationPattern = /@([-\d.]+),([-\d.]+)/;
    const locationMatch = url.match(locationPattern);
    
    // Extract place ID if available
    // Match both the older !1s0x... format and newer place_id=ChIJ... format
    const placeIdPattern = /(?:!1s(0x[\w:]+)|place_id=(ChIJ[\w-]+))/;
    const placeIdMatch = url.match(placeIdPattern);
    
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
    if (placeIdMatch) {
      // Check which capture group has the place ID (either group 1 or 2)
      placeId = placeIdMatch[1] || placeIdMatch[2];
    }
    
    return {
      name: businessName,
      placeId: placeId,
      coordinates: coordinates
    };
  } catch (error) {
    console.error('Error extracting data from URL:', error);
    return null;
  }
}

/**
 * Find a place using the Places API
 */
async function findPlaceFromText(name) {
  try {
    console.log(`Finding place for: ${name}`);
    
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(name)}&inputtype=textquery&fields=place_id,name,formatted_address,types,business_status,geometry&key=${GOOGLE_PLACES_API_KEY}`
    );
    
    if (response.data.status === 'OK' && response.data.candidates && response.data.candidates.length > 0) {
      console.log('Found place:', response.data.candidates[0]);
      return response.data.candidates[0];
    } else {
      console.error('Places API findPlace error:', response.data.status, response.data.error_message);
      return null;
    }
  } catch (error) {
    console.error('Error finding place:', error.message);
    return null;
  }
}

/**
 * Get place details using Place ID
 */
async function getPlaceDetails(placeId) {
  try {
    console.log(`Getting details for place ID: ${placeId}`);
    
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,formatted_phone_number,formatted_address,website,url,user_ratings_total,types,photos,reviews,opening_hours&key=${GOOGLE_PLACES_API_KEY}`
    );
    
    if (response.data.status === 'OK' && response.data.result) {
      return response.data.result;
    } else {
      console.error('Places API details error:', response.data.status, response.data.error_message);
      return null;
    }
  } catch (error) {
    console.error('Error getting place details:', error.message);
    return null;
  }
}

/**
 * Find places nearby a location
 */
async function findNearbyPlaces(coordinates, type) {
  try {
    console.log(`Finding nearby places at: ${coordinates.lat},${coordinates.lng} of type: ${type}`);
    
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coordinates.lat},${coordinates.lng}&radius=1500&type=${type}&key=${GOOGLE_PLACES_API_KEY}`
    );
    
    if (response.data.status === 'OK' && response.data.results) {
      return response.data.results.slice(0, 3); // Return top 3 results
    } else {
      console.error('Places API nearby search error:', response.data.status, response.data.error_message);
      return [];
    }
  } catch (error) {
    console.error('Error finding nearby places:', error.message);
    return [];
  }
}

/**
 * Main test function
 */
async function testGooglePlacesAPI() {
  console.log('Testing Google Places API with URL:', testGmbUrl);
  
  // 1. Extract data from URL
  const extractedData = extractDataFromUrl(testGmbUrl);
  console.log('Extracted data:', extractedData);
  
  // 2. Find place using text search
  let placeDetails = null;
  
  // If we have a place ID, use it directly
  if (extractedData.placeId) {
    placeDetails = await getPlaceDetails(extractedData.placeId);
  } 
  // Otherwise try to find the place using the name
  else if (extractedData.name) {
    const placeCandidate = await findPlaceFromText(extractedData.name);
    
    if (placeCandidate && placeCandidate.place_id) {
      placeDetails = await getPlaceDetails(placeCandidate.place_id);
    }
  }
  
  // Display the place details
  if (placeDetails) {
    console.log('Successfully fetched place details:');
    console.log(JSON.stringify({
      name: placeDetails.name,
      address: placeDetails.formatted_address,
      phoneNumber: placeDetails.formatted_phone_number,
      website: placeDetails.website,
      rating: placeDetails.rating,
      reviews: placeDetails.user_ratings_total,
      types: placeDetails.types.slice(0, 3),
      url: placeDetails.url
    }, null, 2));
    
    // 3. Find nearby competitors
    if (placeDetails.types && placeDetails.types.length > 0 && extractedData.coordinates) {
      // Use the first type to find similar places
      const similarPlaces = await findNearbyPlaces(
        extractedData.coordinates, 
        placeDetails.types[0]
      );
      
      if (similarPlaces.length > 0) {
        console.log('Nearby similar places:');
        console.log(JSON.stringify(similarPlaces.map(place => ({
          name: place.name,
          address: place.vicinity,
          rating: place.rating,
          reviews: place.user_ratings_total,
          location: place.geometry?.location
        })), null, 2));
      }
    }
  } else {
    console.log('Failed to fetch place details');
  }
}

// Run the test
if (GOOGLE_PLACES_API_KEY) {
  testGooglePlacesAPI()
    .then(() => console.log('Test completed'))
    .catch(err => console.error('Test failed:', err));
} else {
  console.error('No Google Places API key found in the .env file');
} 