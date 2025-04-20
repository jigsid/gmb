import { useState } from 'react';
import { FaDownload, FaFilePdf, FaFileExcel, FaImage, FaEnvelope, FaSpinner, FaFileExport, FaFileCsv, FaFileCode } from 'react-icons/fa';

export default function GmbDataExporter({ businessData }) {
  const [isExporting, setIsExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  const handleExport = async (format) => {
    setIsExporting(true);
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message based on format
      let message = '';
      switch (format) {
        case 'pdf':
          message = 'PDF report has been generated and downloaded';
          break;
        case 'excel':
          message = 'Excel data has been downloaded';
          break;
        case 'image':
          message = 'Dashboard image has been saved';
          break;
        case 'email':
          message = 'Report has been sent via email';
          break;
        default:
          message = 'Export completed successfully';
      }
      
      // In a real implementation, we would handle actual file generation
      // and download here, or send API requests for email delivery
      
      alert(message);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
      setShowMenu(false);
    }
  };
  
  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={isExporting || !businessData}
        className={`p-2 rounded-lg text-sm flex items-center ${
          isExporting || !businessData 
            ? 'bg-gray-700 cursor-not-allowed text-gray-400' 
            : 'bg-neutral-800 hover:bg-neutral-700 text-foreground-secondary'
        }`}
      >
        {isExporting ? (
          <>
            <FaSpinner className="animate-spin mr-2" />
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <FaFileExport className="mr-1.5" size={14} />
            Export
          </>
        )}
      </button>
      
      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-neutral-800 rounded-lg shadow-lg overflow-hidden z-10 border border-neutral-700">
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center w-full px-4 py-2 text-sm text-foreground-secondary hover:bg-primary-900/20"
          >
            <FaFileCsv className="mr-2" size={14} />
            Export as CSV
          </button>
          
          <button
            onClick={() => handleExport('json')}
            className="flex items-center w-full px-4 py-2 text-sm text-foreground-secondary hover:bg-primary-900/20"
          >
            <FaFileCode className="mr-2" size={14} />
            Export as JSON
          </button>
          
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center w-full px-4 py-2 text-sm text-foreground-secondary hover:bg-primary-900/20"
          >
            <FaFilePdf className="mr-2" size={14} />
            Export as PDF
          </button>
          
          <button
            onClick={() => handleExport('excel')}
            className="flex items-center w-full px-4 py-2 text-sm text-foreground-secondary hover:bg-primary-900/20"
          >
            <FaFileExcel className="mr-2" size={14} />
            Export as Excel
          </button>
        </div>
      )}
    </div>
  );
} 