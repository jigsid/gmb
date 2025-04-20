import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request) {
  try {
    const { businessData, competitors, seoData } = await request.json();
    
    if (!businessData || !competitors || !seoData) {
      return NextResponse.json(
        { error: 'Business data, competitors, and SEO data are required' },
        { status: 400 }
      );
    }

    console.log('Generating AI insights for:', businessData.name);
    
    // Get Gemini API key from environment variable
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    let insights;
    
    // Use Gemini API if key is available, otherwise fall back to mock insights
    if (GEMINI_API_KEY) {
      try {
        insights = await generateGeminiInsights(GEMINI_API_KEY, businessData, competitors, seoData);
      } catch (geminiError) {
        console.error('Gemini API error:', geminiError);
        // Fall back to mock insights
        insights = generateMockInsights(businessData, competitors, seoData);
      }
    } else {
      console.log('No Gemini API key found, using mock insights');
      insights = generateMockInsights(businessData, competitors, seoData);
    }
    
    return NextResponse.json(insights);
  } catch (error) {
    console.error('AI Insights API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI insights: ' + error.message },
      { status: 500 }
    );
  }
}

/**
 * Generate insights using Google Gemini API
 */
async function generateGeminiInsights(apiKey, business, competitors, seoData) {
  // Initialize the Gemini API
  const genAI = new GoogleGenerativeAI(apiKey);
  // Use Gemini Flash 2.0 model instead of Pro
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
  
  // Format the business data as context for the model
  const businessContext = `Business Name: ${business.name}
   Category: ${business.category || 'Not specified'}
   Rating: ${business.rating}/5 from ${business.reviews} reviews
   Website: ${business.website || 'Not available'}
   Location: ${business.location || 'Not specified'}`;
  
  // Format competitors data
  const competitorsContext = competitors.length > 0 ? 
    `Top Competitors:
     ${competitors.map((comp, i) => 
       `${i+1}. ${comp.name} - Rating: ${comp.rating}/5 from ${comp.reviews} reviews - Website: ${comp.website || 'Not available'}`
     ).join('\n')}` : 
    'No competitor data available';
  
  // Format SEO data
  const seoContext = `SEO Metrics:
   Domain: ${seoData.domain}
   Domain Authority: ${seoData.domainAuthority}/100
   Monthly Traffic: ${seoData.monthlyTraffic}
   Backlinks: ${seoData.backlinks}
   Ranking Keywords: ${seoData.rankingKeywords}`;
  
  // Create the prompt for generating insights
  const prompt = `
    You are an AI business analyst specialized in local SEO and online business presence.
    
    Here is the information about the user's business:
    ${businessContext}
    
    ${competitorsContext}
    
    ${seoContext}
    
    Based on this information, please provide:
    1. A concise summary of the business's current online standing compared to competitors (2-3 sentences)
    2. Three key strengths of the business
    3. Three areas where the business could improve
    4. Five specific recommendations for improving the business's online presence
    5. Brief insights about each competitor (1-2 sentences per competitor)
    
    Format your response as a JSON object with the following structure:
    {
      "summary": "string",
      "strengths": ["string", "string", "string"],
      "weaknesses": ["string", "string", "string"],
      "recommendations": ["string", "string", "string", "string", "string"],
      "competitorInsights": [
        {
          "name": "competitor name",
          "insights": ["insight 1", "insight 2", "insight 3"]
        }
      ]
    }
    
    Do not include any text outside of this JSON structure.
  `;
  
  try {
    // Generate content
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse the JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const jsonString = jsonMatch[0];
      const parsedResponse = JSON.parse(jsonString);
      return parsedResponse;
    } else {
      console.error('Could not parse Gemini response as JSON:', responseText);
      throw new Error('Invalid API response format');
    }
  } catch (error) {
    console.error('Error processing Gemini response:', error);
    throw error;
  }
}

/**
 * Generate mock AI insights based on the provided business data, competitors, and SEO data
 */
function generateMockInsights(business, competitors, seoData) {
  // Determine business standing based on reviews and ratings
  const isLeadingByRating = competitors.every(comp => (comp.rating || 0) <= (business.rating || 0));
  const isLeadingByReviews = competitors.every(comp => (comp.reviews || 0) <= (business.reviews || 0));
  const topCompetitor = competitors.length > 0 ? 
    competitors.reduce((top, comp) => (comp.rating > top.rating ? comp : top), competitors[0]) : 
    null;
  
  // Generate contextual summary based on business performance
  let summary = `${business.name} has a rating of ${business.rating}/5 with ${business.reviews} reviews, which places it `;
  
  if (isLeadingByRating && isLeadingByReviews) {
    summary += 'ahead of its competitors in both ratings and number of reviews. ';
  } else if (isLeadingByRating) {
    summary += 'ahead in ratings but behind some competitors in total review count. ';
  } else if (isLeadingByReviews) {
    summary += 'behind in ratings but ahead in total number of customer reviews. ';
  } else {
    summary += 'behind several competitors in both ratings and review count. ';
  }
  
  summary += seoData.domainAuthority > 40 
    ? `Your domain authority of ${seoData.domainAuthority} is strong, providing a good foundation for your online presence.` 
    : `Your domain authority of ${seoData.domainAuthority} could use improvement to strengthen your online visibility.`;
  
  // Generate strengths based on business data
  const strengths = [];
  if (business.rating >= 4.5) {
    strengths.push(`Excellent customer rating (${business.rating}/5)`);
  } else if (business.rating >= 4.0) {
    strengths.push(`Strong customer rating (${business.rating}/5)`);
  } else {
    strengths.push(`Established online presence with ${business.reviews} reviews`);
  }
  
  if (isLeadingByReviews) {
    strengths.push('Higher customer engagement than competitors (more reviews)');
  }
  
  if (seoData.domainAuthority > 35) {
    strengths.push(`Good domain authority (${seoData.domainAuthority})`);
  } else if (seoData.backlinks > 500) {
    strengths.push(`Strong backlink profile with ${seoData.backlinks} backlinks`);
  }
  
  if (strengths.length < 3) {
    strengths.push(`Well-defined business category: ${business.category}`);
  }
  
  // Generate weaknesses based on business data
  const weaknesses = [];
  if (business.rating < 4.0) {
    weaknesses.push(`Below-average rating (${business.rating}/5) compared to industry standards`);
  }
  
  if (!isLeadingByReviews) {
    weaknesses.push('Fewer customer reviews than some top competitors');
  }
  
  if (seoData.domainAuthority < 40) {
    weaknesses.push(`Room to improve domain authority (currently ${seoData.domainAuthority})`);
  }
  
  if (seoData.backlinks < 500) {
    weaknesses.push(`Limited number of backlinks (${seoData.backlinks})`);
  }
  
  if (weaknesses.length < 3) {
    weaknesses.push('Could improve online visibility through additional marketing channels');
  }
  
  // Generate recommendations based on identified weaknesses
  const recommendations = [
    `Encourage satisfied customers to leave more reviews on Google My Business`,
    `Optimize your website for key industry terms like "${business.category}"`
  ];
  
  if (!isLeadingByRating) {
    recommendations.push('Focus on addressing common customer complaints to improve overall rating');
  }
  
  if (seoData.domainAuthority < 40) {
    recommendations.push('Build more quality backlinks to improve domain authority');
  }
  
  if (topCompetitor) {
    recommendations.push(`Analyze ${topCompetitor.name}'s online strategy for competitive insights`);
  }
  
  recommendations.push('Maintain consistent NAP (Name, Address, Phone) information across all online platforms');
  
  // Trim to top 5 recommendations
  const topRecommendations = recommendations.slice(0, 5);
  
  return {
    summary,
    strengths: strengths.slice(0, 3),
    weaknesses: weaknesses.slice(0, 3),
    recommendations: topRecommendations,
    competitorInsights: generateCompetitorInsights(business, competitors, seoData),
  };
}

/**
 * Generate specific insights for each competitor
 */
function generateCompetitorInsights(business, competitors, seoData) {
  return competitors.map(competitor => {
    const ratingDifference = ((business.rating || 0) - (competitor.rating || 0)).toFixed(1);
    const reviewDifference = (business.reviews || 0) - (competitor.reviews || 0);
    
    const insights = [];
    
    // Rating comparison
    if (parseFloat(ratingDifference) > 0) {
      insights.push(`You have a higher rating (${business.rating}) than ${competitor.name} (${competitor.rating})`);
    } else if (parseFloat(ratingDifference) < 0) {
      insights.push(`${competitor.name} has a higher rating (${competitor.rating}) than you (${business.rating})`);
    } else {
      insights.push(`You and ${competitor.name} have the same rating (${business.rating})`);
    }
    
    // Review comparison
    if (reviewDifference > 0) {
      insights.push(`You have ${reviewDifference} more reviews than ${competitor.name}`);
    } else if (reviewDifference < 0) {
      insights.push(`${competitor.name} has ${Math.abs(reviewDifference)} more reviews than you`);
    } else {
      insights.push(`You and ${competitor.name} have the same number of reviews`);
    }
    
    // Business insight
    insights.push(`${competitor.name} may be targeting similar customers in your ${business.location || 'area'}`);
    
    return {
      name: competitor.name,
      insights: insights
    };
  });
} 