import { NextResponse } from 'next/server';
import axios from 'axios';

// API keys
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const SERPAPI_KEY = process.env.SERPAPI_KEY;

/**
 * API endpoint to find custom competitors based on business type and location
 */
export async function POST(request) {
  try {
    // Get search parameters from request body
    const { searchQuery, businessCategory, businessLocation, filters, coordinates } = await request.json();
    
    if (!businessCategory && !businessLocation && !searchQuery) {
      return NextResponse.json(
        { error: 'At least one of business category, location or search query is required' },
        { status: 400 }
      );
    }

    console.log('Finding real competitors based on:', {
      searchQuery,
      businessCategory,
      businessLocation,
      coordinates
    });

    // Try to use real APIs if available
    let competitors = [];
    let isApiSuccess = false;
    
    // Try to find competitors using Google Places API (nearby search)
    if (GOOGLE_PLACES_API_KEY) {
      try {
        // First try nearby search if we have coordinates from Places Autocomplete
        if (coordinates && coordinates.lat && coordinates.lng) {
          const nearbyResults = await findNearbyCompetitorsByCoordinates(businessCategory, coordinates);
          
          if (nearbyResults && nearbyResults.length > 0) {
            competitors = nearbyResults;
            isApiSuccess = true;
            console.log('Found competitors using Google Maps nearby search with coordinates');
          }
        }
        // Then try nearby search with location string if available
        else if (businessLocation) {
          const nearbyResults = await findNearbyCompetitors(businessCategory, businessLocation);
          
          if (nearbyResults && nearbyResults.length > 0) {
            competitors = nearbyResults;
            isApiSuccess = true;
            console.log('Found competitors using Google Maps nearby search with location string');
          }
        }
        
        // If no results or no location, try text search
        if (!isApiSuccess) {
          const searchParams = buildSearchQuery(businessCategory, businessLocation, searchQuery);
          const placesResults = await searchPlacesAPI(searchParams, coordinates);
          
          if (placesResults && placesResults.length > 0) {
            competitors = placesResults;
            isApiSuccess = true;
            console.log('Found competitors using Google Maps text search');
          }
        }
      } catch (error) {
        console.error('Google Places API error:', error.message);
        // Fall back to other methods
      }
    }
    
    // Try SerpAPI if Google Maps didn't work or isn't available
    if (!isApiSuccess && SERPAPI_KEY) {
      try {
        const serpResults = await searchSerpAPI(businessCategory, businessLocation, searchQuery);
        
        if (serpResults && serpResults.length > 0) {
          competitors = serpResults;
          isApiSuccess = true;
          console.log('Found competitors using SerpAPI');
        }
      } catch (error) {
        console.error('SerpAPI error:', error.message);
        // Fall back to mock data
      }
    }
    
    // If real APIs failed or no API keys, generate mock data
    if (!isApiSuccess) {
      competitors = generateMockCompetitors(businessCategory, businessLocation, searchQuery, filters);
      console.log('Generated mock competitors as fallback');
    }

    // Filter competitors based on advanced filters if needed
    if (filters) {
      competitors = applyAdvancedFilters(competitors, filters);
    }

    // Limit to 8 competitors
    const limitedCompetitors = competitors.slice(0, 8);

    return NextResponse.json(limitedCompetitors);
  } catch (error) {
    console.error('Custom competitors API error:', error);
    return NextResponse.json(
      { error: 'Failed to find competitors: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}

/**
 * Find nearby competitors using Google Places API
 */
async function findNearbyCompetitors(businessType, location) {
  try {
    // First, geocode the location to get coordinates
    const geocodeResponse = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: location,
        key: GOOGLE_PLACES_API_KEY
      }
    });
    
    if (!geocodeResponse.data.results || geocodeResponse.data.results.length === 0) {
      console.log('Could not geocode location:', location);
      return [];
    }
    
    const { lat, lng } = geocodeResponse.data.results[0].geometry.location;
    console.log(`Geocoded ${location} to coordinates: ${lat}, ${lng}`);
    
    // Now use the coordinates to find nearby places of the same type
    const nearbyResponse = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
      params: {
        location: `${lat},${lng}`,
        radius: 5000, // 5km radius
        type: mapCategoryToPlacesType(businessType),
        keyword: businessType,
        key: GOOGLE_PLACES_API_KEY
      }
    });
    
    if (!nearbyResponse.data.results || nearbyResponse.data.results.length === 0) {
      console.log('No nearby places found');
      return [];
    }
    
    // Transform the results to our competitor format
    const competitors = await Promise.all(nearbyResponse.data.results.map(async (place) => {
      // Get more details for each place if needed
      let details = {};
      
      if (place.place_id) {
        try {
          const detailsResponse = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
            params: {
              place_id: place.place_id,
              fields: 'website,formatted_phone_number,url,reviews,types',
              key: GOOGLE_PLACES_API_KEY
            }
          });
          
          if (detailsResponse.data && detailsResponse.data.result) {
            details = detailsResponse.data.result;
          }
        } catch (error) {
          console.error('Error fetching place details:', error.message);
        }
      }
      
      return {
        name: place.name,
        address: place.vicinity || place.formatted_address,
        location: extractLocationFromAddress(place.vicinity || place.formatted_address) || location,
        category: details.types ? categoryFromPlaceTypes(details.types) : 
                 place.types ? categoryFromPlaceTypes(place.types) : businessType,
        rating: place.rating || 0,
        reviews: place.user_ratings_total || 0,
        website: details.website || '',
        phone: details.formatted_phone_number || '',
        placeUrl: details.url || `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
        photos: place.photos ? place.photos.map(photo => ({
          reference: photo.photo_reference,
          width: photo.width,
          height: photo.height
        })) : [],
        distance: place.distance ? `${(place.distance / 1000).toFixed(1)} km` : '< 5 km',
        searchResultType: 'google_maps'
      };
    }));
    
    return competitors;
  } catch (error) {
    console.error('Error finding nearby competitors:', error);
    throw error;
  }
}

/**
 * Build appropriate search query based on available business data
 */
function buildSearchQuery(businessType, location, searchQuery) {
  // If user provided a specific search query, prioritize it
  if (searchQuery) {
    return searchQuery;
  }
  
  // Otherwise build a search query based on business type and location
  let query = '';
  
  if (businessType) {
    query = businessType;
  } else {
    query = 'business';
  }
  
  if (location) {
    query += ` in ${location}`;
  }
  
  return query;
}

/**
 * Search for competitors using Google Places API (text search)
 */
async function searchPlacesAPI(query, coordinates = null) {
  try {
    // Build parameters
    const params = {
      query: query,
      key: GOOGLE_PLACES_API_KEY
    };
    
    // Add location bias if we have coordinates
    if (coordinates && coordinates.lat && coordinates.lng) {
      params.location = `${coordinates.lat},${coordinates.lng}`;
      params.radius = 50000; // 50km radius
    }
    
    // Call the Google Places API text search
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
      params: params
    });
    
    if (!response.data || !response.data.results || response.data.results.length === 0) {
      console.log('No places found for query:', query);
      return [];
    }
    
    console.log(`Found ${response.data.results.length} places for query: ${query}`);
    
    // Get additional details for each place (like website, phone)
    const detailedPlaces = await Promise.all(
      response.data.results.map(async place => {
        // Only fetch details if we have a place_id
        if (!place.place_id) return place;
        
        try {
          const detailsResponse = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
            params: {
              place_id: place.place_id,
              fields: 'website,formatted_phone_number,url,reviews,price_level',
              key: GOOGLE_PLACES_API_KEY
            }
          });
          
          if (detailsResponse.data && detailsResponse.data.result) {
            // Merge the details with the original place data
            return {
              ...place,
              details: detailsResponse.data.result
            };
          }
        } catch (error) {
          console.error('Error fetching place details:', error.message);
        }
        
        return place;
      })
    );
    
    // Calculate distance from origin coordinates if available
    function calculateDistance(lat1, lon1, lat2, lon2) {
      const R = 6371; // Radius of the earth in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      const distance = R * c; // Distance in km
      return distance.toFixed(1);
    }
    
    // Transform and return the results with the additional details
    return detailedPlaces.map(place => {
      // Calculate distance in km if we have coordinates
      let distance = '';
      if (coordinates && coordinates.lat && coordinates.lng && 
          place.geometry && place.geometry.location) {
        const placeLocation = place.geometry.location;
        distance = `${calculateDistance(
          coordinates.lat, 
          coordinates.lng, 
          placeLocation.lat, 
          placeLocation.lng
        )} km`;
      }
      
      return {
        name: place.name,
        address: place.formatted_address,
        location: extractLocationFromAddress(place.formatted_address),
        category: place.types ? place.types.map(t => formatPlacesType(t)).join(', ') : 'Business',
        rating: place.rating || 0,
        reviews: place.user_ratings_total || 0,
        website: place.details?.website || '',
        phone: place.details?.formatted_phone_number || '',
        placeId: place.place_id,
        coordinates: place.geometry?.location,
        distance: distance || undefined,
        priceLevel: place.details?.price_level || place.price_level,
        searchResultType: 'places_api'
      };
    });
  } catch (error) {
    console.error('Places API search error:', error);
    return [];
  }
}

/**
 * Search for competitors using SerpAPI
 */
async function searchSerpAPI(businessType, location, searchQuery) {
  // Build appropriate search query
  let query = buildSearchQuery(businessType, location, searchQuery);
  
  try {
    // Call SerpAPI
    const response = await axios.get('https://serpapi.com/search', {
      params: {
        api_key: SERPAPI_KEY,
        engine: 'google_maps',
        q: query,
        type: 'search',
        google_domain: 'google.com',
        hl: 'en',
        ll: '@0,0,15z', // Default zoom level
      }
    });
    
    const competitors = [];
    
    // Extract from local results if available
    if (response.data && 
        response.data.local_results && 
        response.data.local_results.length > 0) {
      
      response.data.local_results.forEach(place => {
        competitors.push({
          name: place.title,
          address: place.address || '',
          location: extractLocationFromAddress(place.address) || location,
          category: place.type || businessType,
          rating: parseFloat(place.rating) || 0,
          reviews: parseInt(place.reviews_original || place.reviews || '0', 10),
          website: place.website || '',
          phone: place.phone || '',
          gps_coordinates: place.gps_coordinates || null,
          searchResultType: 'serp_maps'
        });
      });
    }
    
    return competitors;
  } catch (error) {
    console.error('SerpAPI search error:', error);
    throw error;
  }
}

/**
 * Generate mock competitors for when APIs are unavailable
 */
function generateMockCompetitors(businessType, location, searchQuery, filters) {
  // Generate realistic looking data based on the available information
  const baseQuery = searchQuery || businessType || 'Business';
  const baseName = baseQuery.replace(/[^a-zA-Z0-9\s]/g, '').trim();
  const minRating = filters?.minRating || 3;
  
  // Generate business name variations
  const generateName = (index) => {
    const prefixes = ['Premium', 'Elite', 'Advanced', 'Top', 'First Choice', 'Capital', 'Golden', 'Royal'];
    const suffixes = ['Solutions', 'Group', 'Services', 'Associates', 'Partners', 'International', 'Experts', 'Professionals'];
    
    if (index % 3 === 0) {
      return `${prefixes[index % prefixes.length]} ${baseName}`;
    } else if (index % 3 === 1) {
      return `${baseName} ${suffixes[index % suffixes.length]}`;
    } else {
      return `${prefixes[index % prefixes.length]} ${baseName} ${suffixes[index % suffixes.length]}`;
    }
  };
  
  // Generate addresses based on location
  const generateAddress = (index) => {
    const streetNumbers = [123, 456, 789, 555, 777, 888, 999, 111];
    const streetNames = ['Main', 'Oak', 'Maple', 'Park', 'Broadway', 'Washington', 'Market', 'Lincoln'];
    const streetTypes = ['St', 'Ave', 'Blvd', 'Dr', 'Rd', 'Way', 'Pl', 'Ln'];
    
    return `${streetNumbers[index % streetNumbers.length]} ${streetNames[index % streetNames.length]} ${streetTypes[index % streetTypes.length]}, ${location || 'Unknown Location'}`;
  };
  
  // Generate ratings above the minimum
  const generateRating = () => {
    const baseRating = Math.max(minRating, 3);
    return Math.min(5, baseRating + (Math.random() * (5 - baseRating)).toFixed(1) * 1);
  };
  
  // Generate realistic review counts
  const generateReviews = (rating) => {
    // Higher rated businesses tend to have more reviews
    const baseReviews = Math.floor(rating * 20);
    return baseReviews + Math.floor(Math.random() * 100);
  };
  
  // Generate phone numbers
  const generatePhone = () => {
    return `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
  };
  
  // Generate website URLs
  const generateWebsite = (name) => {
    const domain = name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
    return `https://www.${domain}`;
  };
  
  // Generate realistic distances
  const generateDistance = (index) => {
    const distances = [0.5, 0.8, 1.2, 1.7, 2.3, 3.1, 3.8, 4.5];
    return `${distances[index % distances.length]} km`;
  };
  
  // Generate mock competitors
  return Array.from({ length: 8 }, (_, i) => {
    const name = generateName(i);
    const rating = generateRating();
    
    return {
      name,
      address: generateAddress(i),
      location: location || 'Unknown Location',
      category: businessType || 'Business',
      rating,
      reviews: generateReviews(rating),
      website: generateWebsite(name),
      phone: generatePhone(),
      distance: generateDistance(i),
      isEstimated: true,
      searchResultType: 'mock'
    };
  });
}

/**
 * Apply advanced filters to competitor results
 */
function applyAdvancedFilters(competitors, filters) {
  let filtered = [...competitors];
  
  // Apply minimum rating filter
  if (filters.minRating > 0) {
    filtered = filtered.filter(comp => (comp.rating || 0) >= filters.minRating);
  }
  
  // Apply maximum distance filter if location data available
  if (filters.maxDistance > 0) {
    filtered = filtered.filter(comp => {
      // If we have numeric distance value
      if (comp.distance) {
        const distanceValue = parseFloat(comp.distance.split(' ')[0]);
        return !isNaN(distanceValue) && distanceValue <= filters.maxDistance;
      }
      return true; // Keep if no distance info
    });
  }
  
  // Apply services filter if available
  if (filters.services && filters.services.length > 0) {
    // This would require detailed service information for each competitor
    // For now, we'll just keep all results
  }
  
  // Apply price range filter if available
  if (filters.priceRange) {
    filtered = filtered.filter(comp => {
      // If we have price_level info
      if (comp.priceLevel !== undefined) {
        const priceLevel = parseInt(comp.priceLevel);
        const targetLevel = filters.priceRange.length; // $ = 1, $$ = 2, etc.
        return priceLevel === targetLevel;
      }
      return true; // Keep if no price info
    });
  }
  
  return filtered;
}

/**
 * Map business category to Google Places API type
 */
function mapCategoryToPlacesType(category) {
  if (!category) return 'establishment';

  // Convert to lowercase for case-insensitive matching
  const categoryLower = category.toLowerCase();
  
  // Map common business categories to Google Places types
  // https://developers.google.com/maps/documentation/places/web-service/supported_types
  const categoryMap = {
    'restaurant': 'restaurant',
    'cafe': 'cafe', 
    'coffee': 'cafe',
    'bar': 'bar',
    'pub': 'bar',
    'hotel': 'lodging',
    'motel': 'lodging',
    'lodging': 'lodging',
    'store': 'store',
    'retail': 'store',
    'shop': 'store',
    'grocery': 'grocery_or_supermarket',
    'supermarket': 'grocery_or_supermarket',
    'gas': 'gas_station',
    'petrol': 'gas_station',
    'bank': 'bank',
    'atm': 'atm',
    'hospital': 'hospital',
    'doctor': 'doctor',
    'pharmacy': 'pharmacy',
    'school': 'school',
    'university': 'university',
    'library': 'library',
    'park': 'park',
    'gym': 'gym',
    'fitness': 'gym',
    'beauty': 'beauty_salon',
    'salon': 'beauty_salon',
    'hair': 'hair_care',
    'spa': 'spa',
    'museum': 'museum',
    'art': 'art_gallery',
    'gallery': 'art_gallery',
    'movie': 'movie_theater',
    'cinema': 'movie_theater',
    'theater': 'movie_theater',
    'parking': 'parking',
    'lawyer': 'lawyer',
    'attorney': 'lawyer',
    'accountant': 'accounting',
    'plumber': 'plumber',
    'electrician': 'electrician',
    'locksmith': 'locksmith',
    'real estate': 'real_estate_agency',
    'realtor': 'real_estate_agency',
    'insurance': 'insurance_agency',
    'travel': 'travel_agency',
    'airport': 'airport',
    'bus': 'bus_station',
    'train': 'train_station',
    'transit': 'transit_station',
    'post office': 'post_office',
    'postal': 'post_office',
    'church': 'church',
    'temple': 'hindu_temple',
    'hindu': 'hindu_temple',
    'mosque': 'mosque',
    'muslim': 'mosque',
    'synagogue': 'synagogue',
    'jewish': 'synagogue',
    'car': 'car_dealer',
    'auto': 'car_dealer',
    'dealer': 'car_dealer',
    'repair': 'car_repair',
    'car repair': 'car_repair',
    'car wash': 'car_wash',
    'car rental': 'car_rental',
    'dentist': 'dentist',
    'furniture': 'furniture_store',
    'hardware': 'hardware_store',
    'home goods': 'home_goods_store',
    'department': 'department_store',
    'electronics': 'electronics_store',
    'jewelry': 'jewelry_store',
    'pet': 'pet_store',
    'shoe': 'shoe_store',
    'clothing': 'clothing_store',
    'book': 'book_store',
    'liquor': 'liquor_store',
    'florist': 'florist',
    'food': 'food',
    'meal': 'meal_takeaway',
    'takeaway': 'meal_takeaway',
    'delivery': 'meal_delivery',
    'night club': 'night_club',
    'club': 'night_club',
    'discount': 'clothing_store'
  };
  
  // Check for category matches
  for (const [key, value] of Object.entries(categoryMap)) {
    if (categoryLower.includes(key)) {
      return value;
    }
  }
  
  // Default to general establishment type
  return 'establishment';
}

/**
 * Convert Google Places API types to a business category
 */
function categoryFromPlaceTypes(types) {
  const typeMap = {
    'restaurant': 'Restaurant',
    'meal_takeaway': 'Restaurant',
    'cafe': 'Cafe',
    'bakery': 'Bakery',
    'lodging': 'Hotel',
    'store': 'Retail Store',
    'grocery_or_supermarket': 'Grocery Store',
    'supermarket': 'Supermarket',
    'beauty_salon': 'Beauty Salon',
    'hair_care': 'Hair Salon',
    'gym': 'Fitness Center',
    'health': 'Healthcare',
    'doctor': 'Medical Clinic',
    'hospital': 'Hospital',
    'dentist': 'Dental Clinic',
    'car_repair': 'Auto Service',
    'car_dealer': 'Car Dealership',
    'gas_station': 'Gas Station',
    'real_estate_agency': 'Real Estate',
    'bank': 'Financial Services',
    'school': 'Education',
    'university': 'University',
    'bar': 'Bar & Nightlife',
    'night_club': 'Bar & Nightlife',
    'lawyer': 'Legal Services',
    'insurance_agency': 'Insurance',
    'pharmacy': 'Pharmacy',
    'pet_store': 'Pet Store',
    'food': 'Food',
    'establishment': 'Business'
  };
  
  // Look for the first type that has a mapping
  for (const type of types) {
    if (typeMap[type]) {
      return typeMap[type];
    }
  }
  
  // If no match, return the first type or 'Business'
  return types[0] ? types[0].replace(/_/g, ' ').replace(/^./, c => c.toUpperCase()) : 'Business';
}

/**
 * Extract location from address
 */
function extractLocationFromAddress(address) {
  if (!address) return '';
  
  // Try to extract city and state
  // Common pattern: text after last comma often contains city/state
  const parts = address.split(',');
  
  if (parts.length > 1) {
    // Last part might be zip code, second to last might be city/state
    const locationPart = parts[parts.length - 2].trim();
    return locationPart;
  }
  
  return '';
}

/**
 * Find nearby competitors using coordinates from Google Maps Places Autocomplete
 */
async function findNearbyCompetitorsByCoordinates(businessType, coordinates) {
  if (!coordinates || !coordinates.lat || !coordinates.lng) {
    console.log('No valid coordinates provided for nearby search');
    return [];
  }
  
  try {
    // Find nearby places of the specified type
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
      params: {
        location: `${coordinates.lat},${coordinates.lng}`,
        radius: 5000, // 5km radius
        type: mapCategoryToPlacesType(businessType),
        key: GOOGLE_PLACES_API_KEY
      }
    });
    
    if (response.data.status !== 'OK' || !response.data.results) {
      console.log('No nearby places found with coordinates');
      return [];
    }
    
    console.log(`Found ${response.data.results.length} places nearby using coordinates`);

    // Get additional details for each place (like website, phone)
    const detailedPlaces = await Promise.all(
      response.data.results.map(async place => {
        // Only fetch details if we have a place_id
        if (!place.place_id) return place;
        
        try {
          const detailsResponse = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
            params: {
              place_id: place.place_id,
              fields: 'website,formatted_phone_number,url,reviews,price_level',
              key: GOOGLE_PLACES_API_KEY
            }
          });
          
          if (detailsResponse.data && detailsResponse.data.result) {
            // Merge the details with the original place data
            return {
              ...place,
              details: detailsResponse.data.result
            };
          }
        } catch (error) {
          console.error('Error fetching place details:', error.message);
        }
        
        return place;
      })
    );
    
    // Calculate distance from origin coordinates
    function calculateDistance(lat1, lon1, lat2, lon2) {
      const R = 6371; // Radius of the earth in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      const distance = R * c; // Distance in km
      return distance.toFixed(1);
    }
    
    // Transform and return the results with the additional details
    return detailedPlaces.map(place => {
      // Calculate distance in km if we have coordinates
      let distance = '';
      if (place.geometry && place.geometry.location) {
        const placeLocation = place.geometry.location;
        distance = `${calculateDistance(
          coordinates.lat, 
          coordinates.lng, 
          placeLocation.lat, 
          placeLocation.lng
        )} km`;
      }
      
      return {
        name: place.name,
        address: place.vicinity,
        location: extractLocationFromAddress(place.vicinity),
        category: businessType || place.types?.map(t => formatPlacesType(t)).join(', ') || 'Business',
        rating: place.rating || 0,
        reviews: place.user_ratings_total || 0,
        website: place.details?.website || '',
        phone: place.details?.formatted_phone_number || '',
        placeId: place.place_id,
        coordinates: place.geometry?.location || coordinates,
        distance: distance || '< 5 km',
        priceLevel: place.details?.price_level || place.price_level,
        searchResultType: 'places_nearby'
      };
    });
  } catch (error) {
    console.error('Error finding nearby competitors by coordinates:', error.message);
    return [];
  }
}

/**
 * Format Google Places API types for display
 */
function formatPlacesType(type) {
  // Replace underscores with spaces and capitalize each word
  return type
    .replace(/_/g, ' ')
    .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
} 