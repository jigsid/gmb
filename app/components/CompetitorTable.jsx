import { FaStar, FaExternalLinkAlt } from 'react-icons/fa';

export default function CompetitorTable({ businessData, competitors, seoData }) {
  // Handle missing or invalid data
  if (!businessData) return null;
  
  // Ensure competitors is always an array
  const competitorsList = Array.isArray(competitors) ? competitors : [];

  return (
    <div className="w-full bg-white p-6 rounded-xl shadow-md overflow-x-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Competitor Comparison</h2>
      
      {competitorsList.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          <p>No competitors found. Try specifying a more precise location or checking your business category.</p>
        </div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Business
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rating
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reviews
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Website
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Your business */}
            <tr className="bg-green-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{businessData.name} <span className="text-primary">(You)</span></div>
                <div className="text-sm text-gray-500">{businessData.address || businessData.location || 'Location not available'}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <FaStar className="text-yellow-500 mr-1" />
                  <span className="text-sm text-gray-900">{businessData.rating || 'N/A'}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {typeof businessData.reviews === 'number' ? businessData.reviews.toLocaleString() : 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {businessData.website ? (
                  <a 
                    href={businessData.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:text-secondary flex items-center"
                  >
                    <FaExternalLinkAlt className="mr-1" size={12} />
                    {/* Safely extract domain from website URL */}
                    {(businessData.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]) || 'website'}
                  </a>
                ) : (
                  'N/A'
                )}
              </td>
            </tr>
            
            {/* Competitors */}
            {competitorsList.map((competitor, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{competitor.name || 'Unknown Competitor'}</div>
                  <div className="text-sm text-gray-500">{competitor.address || competitor.location || ''}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FaStar className="text-yellow-500 mr-1" />
                    <span className="text-sm text-gray-900">{competitor.rating || 'N/A'}</span>
                    {competitor.isEstimated && <span className="ml-1 text-xs text-gray-500">*</span>}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {typeof competitor.reviews === 'number' ? competitor.reviews.toLocaleString() : 'N/A'}
                  {competitor.isEstimated && <span className="ml-1 text-xs">*</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {competitor.website ? (
                    <a 
                      href={competitor.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:text-secondary flex items-center"
                    >
                      <FaExternalLinkAlt className="mr-1" size={12} />
                      {/* Safely extract domain from website URL */}
                      {(competitor.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]) || 'website'}
                    </a>
                  ) : (
                    'N/A'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      {(competitorsList.some(c => c.isEstimated) || (seoData && seoData.isEstimated)) && (
        <p className="text-xs text-gray-500 mt-4 italic">
          * Some metrics are estimated when direct data is not available.
        </p>
      )}
    </div>
  );
} 