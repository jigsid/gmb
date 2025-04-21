(function() {
  // Find the container element
  const container = document.getElementById('business-tool');
  
  if (!container) {
    console.error('Business Comparison Tool: Container element #business-tool not found');
    return;
  }
  
  // Create the iframe element
  const iframe = document.createElement('iframe');
  
  // Set iframe attributes
  const scriptTag = document.currentScript;
  const baseUrl = scriptTag ? new URL(scriptTag.src).origin : 'https://business-comparison-tool.vercel.app';
  iframe.src = `${baseUrl}/embed`; // Use the current origin with /embed path
  iframe.width = '100%';
  iframe.height = '850px';
  iframe.frameBorder = '0';
  iframe.style.borderRadius = '8px';
  iframe.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
  iframe.allow = "clipboard-write";
  
  // Get container data attributes for customization
  const primaryColor = container.getAttribute('data-primary-color');
  const secondaryColor = container.getAttribute('data-secondary-color');
  const height = container.getAttribute('data-height');
  const theme = container.getAttribute('data-theme') || 'dark';
  
  // Append query parameters for customization if provided
  let queryParams = [];
  if (primaryColor) queryParams.push(`primaryColor=${encodeURIComponent(primaryColor)}`);
  if (secondaryColor) queryParams.push(`secondaryColor=${encodeURIComponent(secondaryColor)}`);
  if (theme) queryParams.push(`theme=${encodeURIComponent(theme)}`);
  
  // Apply query parameters
  if (queryParams.length > 0) {
    iframe.src += `?${queryParams.join('&')}`;
  }
  
  // Apply custom height if provided
  if (height) {
    iframe.height = height;
  }
  
  // Append iframe to container
  container.appendChild(iframe);
  
  // Add a small attribution if container is empty
  if (container.childNodes.length === 1) {
    const attribution = document.createElement('div');
    attribution.style.fontSize = '10px';
    attribution.style.textAlign = 'right';
    attribution.style.marginTop = '4px';
    attribution.style.color = '#888';
    attribution.innerHTML = `Powered by <a href="${baseUrl}" target="_blank" style="color: #888; text-decoration: underline;">Business Comparison Tool</a>`;
    container.appendChild(attribution);
  }
})(); 