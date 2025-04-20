import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// MOCK IMPLEMENTATION NOW COMMENTED OUT
/*
export async function POST(request) {
  try {
    const { question, businessData, competitors, seoData, aiInsights } = await request.json();
    
    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    // For production, use actual Gemini API
    // This is a mock response for development
    const responses = {
      "how can i improve my reviews": `To improve your reviews for ${businessData?.name || 'your business'}, consider these strategies:
1. Actively request reviews from satisfied customers
2. Make the review process easy with direct links
3. Respond promptly and professionally to all reviews, both positive and negative
4. Address negative feedback constructively and show how you're improving
5. Create memorable customer experiences that naturally inspire positive reviews`,
      
      "who is my strongest competitor": `Based on the data, ${competitors?.[0]?.name || 'your top competitor'} appears to be your strongest competition. They have a rating of ${competitors?.[0]?.rating || '4.0+'} with ${competitors?.[0]?.reviews || '100+'} reviews. They're particularly strong in online visibility and customer engagement.`,
      
      "how can i improve my seo": `To improve your SEO for ${businessData?.name || 'your business'}, focus on:
1. Building quality backlinks from reputable sites in your industry
2. Creating content optimized for terms like "${businessData?.category || 'your industry'}"
3. Improving site speed and mobile responsiveness
4. Enhancing local SEO by optimizing your Google My Business listing
5. Developing a content strategy that addresses customer questions`,
      
      "what is domain authority": `Domain Authority (DA) is a search engine ranking score developed by Moz that predicts how likely a website is to rank in search engine result pages. Scores range from 1 to 100, with higher scores indicating better ranking potential. Your current DA is ${seoData?.domainAuthority || 'not available'}, which ${seoData?.domainAuthority > 40 ? 'is relatively strong' : 'has room for improvement'}.`,
      
      "how do i compete with businesses that have more reviews": `To compete with businesses that have more reviews:
1. Focus on quality of service to generate more positive reviews
2. Highlight your unique strengths and differentiators
3. Engage more actively with customers online
4. Consider creating showcase content like case studies or testimonials
5. Develop niche specializations that set you apart from competitors with more reviews but less specialized expertise`,
    };

    // Find the most relevant pre-defined response or use default
    const lowerQuestion = question.toLowerCase();
    let response = "I don't have enough context to answer that specific question. Could you rephrase or ask something about your business metrics, competitors, or SEO performance?";
    
    for (const [key, value] of Object.entries(responses)) {
      if (lowerQuestion.includes(key)) {
        response = value;
        break;
      }
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error('AI Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process your question' },
      { status: 500 }
    );
  }
}
*/

// PRODUCTION CODE NOW UNCOMMENTED
export async function POST(request) {
  try {
    const { question, businessData, competitors, seoData, aiInsights } = await request.json();
    
    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    console.log('Processing chat question:', question);
    
    // Get Gemini API key from environment variable
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    let response;
    
    // Use Gemini API if key is available, otherwise fall back to mock response
    if (GEMINI_API_KEY) {
      try {
        response = await getGeminiResponse(GEMINI_API_KEY, question, businessData, competitors, seoData, aiInsights);
      } catch (geminiError) {
        console.error('Gemini API error:', geminiError);
        // Fall back to mock response
        response = generateMockResponse(question, businessData, competitors, seoData, aiInsights);
      }
    } else {
      console.log('No Gemini API key found, using mock response');
      response = generateMockResponse(question, businessData, competitors, seoData, aiInsights);
    }
    
    return NextResponse.json({ response });
  } catch (error) {
    console.error('AI Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process your question: ' + error.message },
      { status: 500 }
    );
  }
}

/**
 * Get response from Google Gemini API
 */
async function getGeminiResponse(apiKey, question, business, competitors, seoData, aiInsights) {
  // Initialize the Gemini API
  const genAI = new GoogleGenerativeAI(apiKey);
  // Use Gemini Flash 2.0 model instead of Pro
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
  
  // Format the business data as context for the model
  const businessContext = business ? 
    `Business Name: ${business.name}
     Category: ${business.category || 'Not specified'}
     Rating: ${business.rating}/5 from ${business.reviews} reviews
     Website: ${business.website || 'Not available'}
     Location: ${business.location || 'Not specified'}` : 
    'No business data available';
  
  // Format competitors data
  const competitorsContext = competitors && competitors.length > 0 ? 
    `Top Competitors:
     ${competitors.map((comp, i) => 
       `${i+1}. ${comp.name} - Rating: ${comp.rating}/5 from ${comp.reviews} reviews - Website: ${comp.website || 'Not available'}`
     ).join('\n')}` : 
    'No competitor data available';
  
  // Format SEO data
  const seoContext = seoData ? 
    `SEO Metrics:
     Domain: ${seoData.domain}
     Domain Authority: ${seoData.domainAuthority}/100
     Monthly Traffic: ${seoData.monthlyTraffic}
     Backlinks: ${seoData.backlinks}
     Ranking Keywords: ${seoData.rankingKeywords}` : 
    'No SEO data available';
  
  // Format AI insights if available
  const insightsContext = aiInsights ? 
    `AI Insights:
     Summary: ${aiInsights.summary}
     Strengths: ${aiInsights.strengths.join(', ')}
     Weaknesses: ${aiInsights.weaknesses.join(', ')}
     Recommendations: ${aiInsights.recommendations.join(', ')}` : 
    'No AI insights available';
  
  // Create the prompt with all available context
  const prompt = `
    You are an AI business consultant specialized in local SEO and online business presence.
    
    Here is the information about the user's business:
    ${businessContext}
    
    ${competitorsContext}
    
    ${seoContext}
    
    ${insightsContext}
    
    Based on this information, please answer the following question:
    "${question}"
    
    Keep your response concise, direct, and professional. Focus only on answering what was asked.
  `;
  
  // Generate content
  const result = await model.generateContent(prompt);
  const response = result.response.text();
  
  return response;
}

/**
 * Generate mock response based on question and business data
 */
function generateMockResponse(question, business, competitors, seoData, aiInsights) {
  // Prepare common response templates
  const responses = {
    "how can i improve my reviews": `To improve your reviews for ${business?.name || 'your business'}, consider these strategies:
1. Actively request reviews from satisfied customers
2. Make the review process easy with direct links
3. Respond promptly and professionally to all reviews, both positive and negative
4. Address negative feedback constructively and show how you're improving
5. Create memorable customer experiences that naturally inspire positive reviews`,
    
    "who is my strongest competitor": `Based on the data, ${competitors?.[0]?.name || 'your top competitor'} appears to be your strongest competition. They have a rating of ${competitors?.[0]?.rating || '4.0+'} with ${competitors?.[0]?.reviews || '100+'} reviews. They're particularly strong in online visibility and customer engagement.`,
    
    "how can i improve my seo": `To improve your SEO for ${business?.name || 'your business'}, focus on:
1. Building quality backlinks from reputable sites in your industry
2. Creating content optimized for terms like "${business?.category || 'your industry'}"
3. Improving site speed and mobile responsiveness
4. Enhancing local SEO by optimizing your Google My Business listing
5. Developing a content strategy that addresses customer questions`,
    
    "what is domain authority": `Domain Authority (DA) is a search engine ranking score that predicts how likely a website is to rank in search engine result pages. Scores range from 1 to 100, with higher scores indicating better ranking potential. Your current DA is ${seoData?.domainAuthority || 'not available'}, which ${seoData?.domainAuthority > 40 ? 'is relatively strong' : 'has room for improvement'}.`,
    
    "how do i compete with businesses that have more reviews": `To compete with businesses that have more reviews:
1. Focus on quality of service to generate more positive reviews
2. Highlight your unique strengths and differentiators
3. Engage more actively with customers online
4. Consider creating showcase content like case studies or testimonials
5. Develop niche specializations that set you apart from competitors with more reviews but less specialized expertise`,

    "explain my ai insights": aiInsights ? 
      `Based on our analysis: ${aiInsights.summary} For strengths, we've identified: ${aiInsights.strengths.join(', ')}. Areas to improve include: ${aiInsights.weaknesses.join(', ')}. Our top recommendations are to ${aiInsights.recommendations.join(' and to ')}.` :
      `We don't have enough information to provide AI insights for your business yet.`,
      
    "how am i doing compared to competitors": competitors && business ?
      `Your business (${business.name}) has a rating of ${business.rating}/5 with ${business.reviews} reviews. Your top competitor (${competitors[0].name}) has a rating of ${competitors[0].rating}/5 with ${competitors[0].reviews} reviews. ${business.rating > competitors[0].rating ? 'You have a higher rating' : 'They have a higher rating'} and ${business.reviews > competitors[0].reviews ? 'you have more reviews.' : 'they have more reviews.'}` :
      `We don't have enough information about your business and competitors to compare yet.`,
      
    "what is my monthly traffic": seoData ?
      `Based on our estimates, your website (${seoData.domain}) receives approximately ${seoData.monthlyTraffic.toLocaleString()} monthly visitors. This is ${seoData.monthlyTraffic > 5000 ? 'a good amount of' : 'an area where you could improve your'} traffic for your business category.` :
      `We don't have enough information about your website traffic yet.`
  };

  // Process question to determine best response
  const lowerQuestion = question.toLowerCase();
  
  // Find the most relevant response template
  for (const [key, value] of Object.entries(responses)) {
    if (lowerQuestion.includes(key)) {
      return value;
    }
  }
  
  // Handle questions about business data
  if (business && (lowerQuestion.includes("my business") || lowerQuestion.includes("business data") || lowerQuestion.includes("rating") || lowerQuestion.includes("reviews"))) {
    return `Your business (${business.name}) is in the ${business.category} category with a rating of ${business.rating}/5 based on ${business.reviews} reviews. You're located in ${business.location || 'your area'} and your website is ${business.website}.`;
  }
  
  // Handle questions about SEO performance
  if (seoData && (lowerQuestion.includes("seo") || lowerQuestion.includes("website") || lowerQuestion.includes("domain") || lowerQuestion.includes("backlinks") || lowerQuestion.includes("traffic"))) {
    return `Your website (${seoData.domain}) has a domain authority of ${seoData.domainAuthority}/100, ${seoData.backlinks} backlinks, and ranks for approximately ${seoData.rankingKeywords} keywords. You receive about ${seoData.monthlyTraffic.toLocaleString()} monthly visitors according to our estimates.`;
  }
  
  // Default response for when we don't have a specific answer
  return `I don't have enough information to answer that specific question. Could you rephrase or ask something about your business metrics, competitors, or SEO performance?`;
} 