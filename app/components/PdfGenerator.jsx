import { useState } from 'react';
import { FaFilePdf, FaSpinner, FaChartLine, FaDownload } from 'react-icons/fa';

export default function PdfGenerator({ businessData, competitors, seoData, aiInsights }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePdf = async () => {
    setIsGenerating(true);
    
    try {
      // Import jsPDF and html2canvas only when needed (client-side)
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;
      
      // Create new PDF document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      // Set up fonts and colors
      const primaryColor = [41, 121, 255]; // Blue
      const secondaryColor = [100, 100, 100]; // Gray
      const accentColor = [255, 193, 7]; // Amber
      
      // Add logo and header
      doc.setFillColor(245, 247, 250);
      doc.rect(0, 0, 210, 30, 'F');
      
      doc.setFontSize(24);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('Business Intelligence Report', 105, 15, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 22, { align: 'center' });
      
      // Add business details
      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0);
      doc.text(`${businessData.name}`, 15, 40);
      
      doc.setFontSize(11);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text(`Category: ${businessData.category || 'Business'}`, 15, 48);
      doc.text(`Location: ${businessData.location || businessData.address || 'N/A'}`, 15, 54);
      doc.text(`Rating: ${businessData.rating}/5 (${businessData.reviews} reviews)`, 15, 60);
      
      if (businessData.website) {
        doc.text(`Website: ${businessData.website}`, 15, 66);
      }
      
      // Add key metrics section
      doc.setFillColor(245, 247, 250);
      doc.roundedRect(15, 75, 180, 40, 3, 3, 'F');
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Key Performance Metrics', 20, 85);
      
      // Draw rating bar
      doc.setFontSize(10);
      doc.text('Rating Score:', 20, 95);
      doc.setDrawColor(220, 220, 220);
      doc.setFillColor(220, 220, 220);
      doc.roundedRect(70, 92, 100, 5, 2, 2, 'F');
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      const ratingWidth = (businessData.rating / 5) * 100;
      doc.roundedRect(70, 92, ratingWidth, 5, 2, 2, 'F');
      doc.text(`${businessData.rating}/5`, 175, 95, { align: 'right' });
      
      // Draw reviews bar
      doc.text('Review Volume:', 20, 105);
      doc.setDrawColor(220, 220, 220);
      doc.setFillColor(220, 220, 220);
      doc.roundedRect(70, 102, 100, 5, 2, 2, 'F');
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      // Calculate review bar based on benchmarks (100+ reviews is excellent)
      const reviewWidth = Math.min((businessData.reviews / 100) * 100, 100);
      doc.roundedRect(70, 102, reviewWidth, 5, 2, 2, 'F');
      doc.text(`${businessData.reviews}`, 175, 105, { align: 'right' });
      
      // Add market position if competitors exist
      if (competitors && competitors.length > 0) {
        const avgCompetitorRating = competitors.reduce((sum, comp) => sum + (comp.rating || 0), 0) / competitors.length;
        const avgCompetitorReviews = competitors.reduce((sum, comp) => sum + (comp.reviews || 0), 0) / competitors.length;
        
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Competitive Analysis', 15, 130);
        
        doc.setFontSize(10);
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        
        // Create a simple table for competitor comparison
        doc.text('Metric', 20, 140);
        doc.text('Your Business', 80, 140);
        doc.text('Competitors Avg', 130, 140);
        doc.text('Difference', 175, 140);
        
        doc.line(15, 143, 195, 143);
        
        doc.text('Rating', 20, 150);
        doc.text(`${businessData.rating}/5`, 80, 150);
        doc.text(`${avgCompetitorRating.toFixed(1)}/5`, 130, 150);
        const ratingDiff = businessData.rating - avgCompetitorRating;
        doc.setTextColor(ratingDiff >= 0 ? 0 : 255, ratingDiff >= 0 ? 150 : 0, 0);
        doc.text(`${ratingDiff > 0 ? '+' : ''}${ratingDiff.toFixed(1)}`, 175, 150);
        
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.text('Reviews', 20, 158);
        doc.text(`${businessData.reviews}`, 80, 158);
        doc.text(`${Math.round(avgCompetitorReviews)}`, 130, 158);
        const reviewsDiff = businessData.reviews - avgCompetitorReviews;
        doc.setTextColor(reviewsDiff >= 0 ? 0 : 255, reviewsDiff >= 0 ? 150 : 0, 0);
        doc.text(`${reviewsDiff > 0 ? '+' : ''}${Math.round(reviewsDiff)}`, 175, 158);
        
        // Add competitor list with ratings
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.text('Top Competitors', 15, 175);
        
        const top5Competitors = competitors
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 5);
          
        let yPos = 185;
        top5Competitors.forEach((competitor, index) => {
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          doc.text(`${index + 1}. ${competitor.name}`, 20, yPos);
          
          doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
          doc.text(`Rating: ${competitor.rating}/5 (${competitor.reviews || 0} reviews)`, 20, yPos + 5);
          
          yPos += 12;
        });
      }
      
      // Add SEO metrics if available
      if (seoData) {
        // Check if we need a new page
        if (competitors && competitors.length > 0) {
          doc.addPage();
          yPos = 20;
        } else {
          yPos = 130;
        }
        
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('SEO Performance', 15, yPos);
        
        doc.setFillColor(245, 247, 250);
        doc.roundedRect(15, yPos + 5, 180, 50, 3, 3, 'F');
        
        doc.setFontSize(10);
        doc.text('Domain:', 20, yPos + 18);
        doc.text(seoData.domain, 120, yPos + 18);
        
        doc.text('Domain Authority:', 20, yPos + 26);
        doc.text(`${seoData.domainAuthority}/100`, 120, yPos + 26);
        
        doc.text('Monthly Traffic:', 20, yPos + 34);
        doc.text(formatTraffic(seoData.monthlyTraffic), 120, yPos + 34);
        
        doc.text('Ranking Keywords:', 20, yPos + 42);
        doc.text(seoData.rankingKeywords.toLocaleString(), 120, yPos + 42);
        
        doc.text('Backlinks:', 20, yPos + 50);
        doc.text(seoData.backlinks.toLocaleString(), 120, yPos + 50);
        
        yPos += 60;
      }
      
      // Add AI insights
      if (aiInsights) {
        // Check if we need a new page based on vertical position
        if (yPos > 200) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('AI-Generated Growth Insights', 15, yPos);
        
        yPos += 10;
        
        // Add summary box
        doc.setFillColor(245, 247, 250);
        doc.roundedRect(15, yPos, 180, 25, 3, 3, 'F');
        
        doc.setFontSize(10);
        const summaryLines = doc.splitTextToSize(aiInsights.summary, 170);
        doc.text(summaryLines, 20, yPos + 8);
        
        yPos += 30;
        
        // Strengths and weaknesses in two columns
        doc.setFontSize(12);
        doc.text('Strengths', 20, yPos);
        doc.text('Areas for Improvement', 110, yPos);
        
        yPos += 8;
        
        doc.setFontSize(9);
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        
        const maxItems = Math.max(
          aiInsights.strengths.length,
          aiInsights.weaknesses.length
        );
        
        for (let i = 0; i < Math.min(maxItems, 5); i++) {
          if (i < aiInsights.strengths.length) {
            const strengthLines = doc.splitTextToSize(`• ${aiInsights.strengths[i]}`, 80);
            doc.text(strengthLines, 20, yPos);
          }
          
          if (i < aiInsights.weaknesses.length) {
            const weaknessLines = doc.splitTextToSize(`• ${aiInsights.weaknesses[i]}`, 80);
            doc.text(weaknessLines, 110, yPos);
          }
          
          yPos += 10;
        }
        
        // Check if we need a new page for recommendations
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        } else {
          yPos += 10;
        }
        
        // Add recommendations
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text('Growth Recommendations', 15, yPos);
        
        yPos += 8;
        
        doc.setFontSize(9);
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        
        for (let i = 0; i < Math.min(aiInsights.recommendations.length, 5); i++) {
          const recLines = doc.splitTextToSize(`${i + 1}. ${aiInsights.recommendations[i]}`, 175);
          doc.text(recLines, 20, yPos);
          yPos += recLines.length * 5 + 5;
          
          // Check if we need a new page
          if (yPos > 270 && i < aiInsights.recommendations.length - 1) {
            doc.addPage();
            yPos = 20;
          }
        }
      }
      
      // Add footer on all pages
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Business Intelligence Report', 20, 285);
        doc.text(`Page ${i} of ${pageCount}`, 180, 285);
      }
      
      // Save the PDF
      doc.save(`${businessData.name.replace(/\s+/g, '_')}_Business_Intelligence.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={generatePdf}
      disabled={isGenerating || !businessData}
      className={`flex items-center justify-center px-4 py-2 rounded-lg ${
        isGenerating || !businessData 
          ? 'bg-gray-200 dark:bg-gray-700 cursor-not-allowed text-gray-500 dark:text-gray-400' 
          : 'bg-primary-500 hover:bg-primary-600 text-white'
      }`}
    >
      {isGenerating ? (
        <>
          <FaSpinner className="animate-spin mr-2" />
          <span>Generating PDF...</span>
        </>
      ) : (
        <>
          <FaDownload className="mr-2" />
          <span>Download Report</span>
        </>
      )}
    </button>
  );
}

// Helper function to format numbers
function formatTraffic(num) {
  if (!num) return '0';
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString();
} 