import { useState, useEffect } from 'react';

/**
 * A hook that simulates tracking Google My Business data over time
 * In a real implementation, this would fetch historical data from an API or database
 */
export default function useGmbDataTracking(businessData) {
  const [historicalData, setHistoricalData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [changeMetrics, setChangeMetrics] = useState(null);

  useEffect(() => {
    if (!businessData) {
      setHistoricalData(null);
      setChangeMetrics(null);
      setIsLoading(false);
      return;
    }

    // Simulate API call to get historical data
    setIsLoading(true);
    
    const generateHistoricalData = () => {
      // Generate fake historical data for the last 6 months
      const currentDate = new Date();
      const data = [];

      for (let i = 5; i >= 0; i--) {
        const month = new Date(currentDate);
        month.setMonth(currentDate.getMonth() - i);
        
        // Generate slightly different values for each month
        // with a general upward trend
        const randomVariation = (Math.random() * 0.1) - 0.05; // -5% to +5%
        const growthFactor = 1 + (0.02 * (5 - i)); // Gradual growth
        
        // Calculate rating with small variations but within 0-5 range
        const ratingVariation = (Math.random() * 0.3) - 0.15; // -0.15 to +0.15
        let historicalRating = businessData.rating - (ratingVariation * (i / 2));
        historicalRating = Math.min(5, Math.max(1, historicalRating));

        // Calculate reviews with growth over time
        const reviewsGrowth = businessData.reviews / (growthFactor + randomVariation);
        
        data.push({
          date: month.toISOString().slice(0, 7), // YYYY-MM format
          rating: Number(historicalRating.toFixed(1)),
          reviews: Math.floor(reviewsGrowth)
        });
      }

      return data;
    };

    // Calculate change metrics (month-over-month)
    const calculateChangeMetrics = (data) => {
      if (!data || data.length < 2) return null;
      
      const current = data[data.length - 1];
      const previous = data[data.length - 2];
      
      const ratingChange = current.rating - previous.rating;
      const reviewsChange = current.reviews - previous.reviews;
      const reviewsChangePercent = previous.reviews === 0 
        ? 100 
        : ((reviewsChange / previous.reviews) * 100);
      
      return {
        ratingChange,
        reviewsChange,
        reviewsChangePercent: Number(reviewsChangePercent.toFixed(1)),
        isRatingImproved: ratingChange > 0,
        isReviewsImproved: reviewsChange > 0
      };
    };

    // Simulate API delay
    const timer = setTimeout(() => {
      const data = generateHistoricalData();
      setHistoricalData(data);
      setChangeMetrics(calculateChangeMetrics(data));
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [businessData]);

  return {
    historicalData,
    changeMetrics,
    isLoading,
    
    // Helper function to get month-over-month percentage change
    getGrowthRate: () => {
      if (!changeMetrics) return 0;
      return changeMetrics.reviewsChangePercent;
    },
    
    // Helper to get month labels for charts
    getMonthLabels: () => {
      if (!historicalData) return [];
      return historicalData.map(item => {
        const [year, month] = item.date.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleString('default', { month: 'short' });
      });
    },
    
    // Helper to get review counts for charts
    getReviewCounts: () => {
      if (!historicalData) return [];
      
      const counts = historicalData.map(item => item.reviews);
      const maxCount = Math.max(...counts);
      
      // Return formatted data with height percentage and label
      return historicalData.map((item, i) => {
        const [year, month] = item.date.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return {
          value: item.reviews,
          height: (item.reviews / maxCount) * 100,
          label: date.toLocaleString('default', { month: 'short' })
        };
      });
    },
    
    // Helper to get rating values for charts
    getRatingValues: () => {
      if (!historicalData) return [];
      
      // For ratings, we want the height to be relative to the 5-star scale
      return historicalData.map((item, i) => {
        const [year, month] = item.date.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return {
          value: item.rating,
          height: (item.rating / 5) * 100, // Calculate height as percentage of 5 stars
          label: date.toLocaleString('default', { month: 'short' })
        };
      });
    }
  };
} 