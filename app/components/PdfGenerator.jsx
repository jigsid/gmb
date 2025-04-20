import { useState } from 'react';
import { FaFilePdf, FaSpinner } from 'react-icons/fa';

export default function PdfGenerator({ businessData, competitors, seoData, aiInsights }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePdf = async () => {
    setIsGenerating(true);
    
    try {
      // Import jsPDF only when needed (client-side)
      const { jsPDF } = await import('jspdf');
      
      // Create new PDF document
      const doc = new jsPDF();
      
      // Add header
      doc.setFontSize(22);
      doc.setTextColor(52, 211, 153); // Primary color
      doc.text('Business Comparison Report', 105, 20, { align: 'center' });
      
      // Add business details
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text(`${businessData.name}`, 20, 40);
      
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Address: ${businessData.address}`, 20, 50);
      doc.text(`Rating: ${businessData.rating}/5 (${businessData.reviews} reviews)`, 20, 60);
      doc.text(`Website: ${businessData.website || 'N/A'}`, 20, 70);
      
      // Add SEO metrics
      if (seoData) {
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('SEO Metrics', 20, 90);
        
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`Domain Authority: ${seoData.domainAuthority}`, 20, 100);
        doc.text(`Monthly Traffic: ${formatNumber(seoData.monthlyTraffic)}`, 20, 110);
        doc.text(`Backlinks: ${formatNumber(seoData.backlinks)}`, 20, 120);
        
        if (seoData.dataSource === 'fallback' || seoData.isEstimated) {
          doc.setFontSize(9);
          doc.setTextColor(150, 150, 150);
          doc.text('* SEO metrics are estimated using our proprietary algorithm', 20, 130);
        } else if (seoData.dataSource === 'free-tools') {
          doc.setFontSize(9);
          doc.setTextColor(150, 150, 150);
          doc.text('* SEO metrics are generated using free web analysis tools', 20, 130);
        }
      }
      
      // Add AI Insights
      if (aiInsights) {
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('AI-Generated Insights', 20, 140);
        
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        
        // Add wrapped text for summary
        const summaryLines = doc.splitTextToSize(aiInsights.summary, 170);
        doc.text(summaryLines, 20, 150);
        
        // Calculate vertical position after summary
        let yPos = 150 + (summaryLines.length * 7);
        
        // Add strengths
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Strengths:', 20, yPos + 10);
        yPos += 20;
        
        doc.setFontSize(11);
        doc.setTextColor(100, 100, 100);
        aiInsights.strengths.forEach((strength, index) => {
          doc.text(`• ${strength}`, 25, yPos);
          yPos += 7;
        });
        
        // Add recommendations (check if we need a new page)
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Recommendations:', 20, yPos + 10);
        yPos += 20;
        
        doc.setFontSize(11);
        doc.setTextColor(100, 100, 100);
        aiInsights.recommendations.forEach((rec, index) => {
          const recLines = doc.splitTextToSize(`• ${rec}`, 165);
          doc.text(recLines, 25, yPos);
          yPos += (recLines.length * 7);
        });
      }
      
      // Add competitor comparison section
      if (competitors && competitors.length > 0) {
        // Add a new page for competitors
        doc.addPage();
        
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('Competitor Comparison', 105, 20, { align: 'center' });
        
        let yPos = 40;
        
        // List competitors
        competitors.forEach((competitor, index) => {
          doc.setFontSize(14);
          doc.setTextColor(0, 0, 0);
          doc.text(`${index + 1}. ${competitor.name}`, 20, yPos);
          
          doc.setFontSize(11);
          doc.setTextColor(100, 100, 100);
          doc.text(`Rating: ${competitor.rating}/5 (${competitor.reviews || 0} reviews)`, 25, yPos + 7);
          doc.text(`Address: ${competitor.address || 'N/A'}`, 25, yPos + 14);
          
          // Add competitor insights if available
          if (aiInsights && aiInsights.competitorInsights && aiInsights.competitorInsights[index]) {
            const insights = aiInsights.competitorInsights[index].insights;
            doc.setFontSize(11);
            doc.text('AI Insights:', 25, yPos + 21);
            
            insights.forEach((insight, i) => {
              const insightLines = doc.splitTextToSize(`• ${insight}`, 165);
              doc.text(insightLines, 30, yPos + 28 + (i * 7));
              yPos += (insightLines.length - 1) * 7;
            });
          }
          
          yPos += 50;
          
          // Check if we need a new page
          if (yPos > 250 && index < competitors.length - 1) {
            doc.addPage();
            yPos = 20;
          }
        });
      }
      
      // Add footer on all pages
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 285);
        doc.text(`Page ${i} of ${pageCount}`, 180, 285);
      }
      
      // Save the PDF
      doc.save(`Business_Comparison_${businessData.name.replace(/\s+/g, '_')}.pdf`);
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
      className={`flex items-center justify-center px-4 py-2 rounded-md ${
        isGenerating || !businessData 
          ? 'bg-gray-300 cursor-not-allowed text-gray-600' 
          : 'bg-primary-50 hover:bg-primary-100 dark:bg-primary-500 dark:hover:bg-primary-600'
      }`}
    >
      {isGenerating ? (
        <>
          <FaSpinner className="animate-spin mr-2 text-gray-600 dark:text-white" />
          <span className="text-gray-600 dark:text-white">Generating PDF...</span>
        </>
      ) : (
        <>
          <FaFilePdf className="mr-2 text-primary-600 dark:text-white" />
          <span className="text-gray-700 dark:text-white">Download PDF Report</span>
        </>
      )}
    </button>
  );
}

// Helper function to format numbers
function formatNumber(num) {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString();
} 