# Business Comparison Tool

An AI-powered tool that helps businesses compare their online presence with competitors. This tool analyzes Google My Business data, SEO metrics, and provides actionable recommendations.

## Features

- **GMB Profile URL Input**: Simply enter your Google My Business profile URL to analyze your business
- **Competitor Analysis**: Identify top competitors in your area
- **Places Autocomplete**: Use Google Places API to find and autocomplete locations when searching for competitors
- **SEO Performance**: Analyze domain authority and traffic performance
- **AI Insights**: Get AI-generated recommendations and competitor analysis
- **Interactive Chatbot**: Ask questions about your business performance
- **PDF Reports**: Generate downloadable PDF reports

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS, Framer Motion
- **APIs**:
  - Google Places API (for business data)
  - SerpApi (for competitor data)
  - Moz API (for SEO metrics, with fallback to SerpApi/Gemini)
  - Google Gemini API (for AI insights and chatbot)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.local.example` to `.env.local` and add your API keys:
   ```bash
   cp .env.local.example .env.local
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## API Keys Required

- Google Places API: [Get key](https://developers.google.com/maps/documentation/places/web-service/get-api-key)
- SerpApi: [Get key](https://serpapi.com/)
- Moz API: [Get key](https://moz.com/products/api)
- Google Gemini API: [Get key](https://ai.google.dev/)

## Embedding the Tool

You can embed this tool in other websites using an iframe:

```html
<iframe 
  src="https://your-deployed-url.com" 
  width="100%" 
  height="800px" 
  frameborder="0">
</iframe>
```

## Deployment

This project is ready to be deployed on Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/business-comparison-tool)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
