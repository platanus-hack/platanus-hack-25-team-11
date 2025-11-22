// Popup script for displaying blocker status

function displayStatus(data) {
  const content = document.getElementById('content');

  if (!data) {
    content.innerHTML = `
      <div class="status-card">
        <div class="status-indicator">
          <div class="status-dot inactive"></div>
          <div class="status-text">Unable to analyze page</div>
        </div>
      </div>
    `;
    return;
  }

  const isCheckout = data.isCheckout || false;
  const indicators = data.indicators || [];

  content.innerHTML = `
    <div class="status-card">
      <div class="status-indicator">
        <div class="status-dot ${isCheckout ? 'active' : 'inactive'}"></div>
        <div class="status-text">
          ${isCheckout ? 'Checkout Detected!' : 'No Checkout Detected'}
        </div>
      </div>

      ${indicators.length > 0 ? `
        <div class="indicators">
          <strong style="font-size: 12px; color: #333;">Detection Indicators:</strong>
          ${indicators.map(ind => `
            <div class="indicator-item">
              <span class="indicator-label">${ind.type.replace(/_/g, ' ')}</span>
              <span class="indicator-score">${Math.round(ind.score)}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${data.url ? `
        <div class="url-info">
          ${data.url}
        </div>
      ` : ''}
    </div>

    <button class="refresh-btn" id="refreshBtn">Refresh Analysis</button>
  `;

  // Add refresh button listener
  document.getElementById('refreshBtn').addEventListener('click', () => {
    refreshAnalysis();
  });
}

function refreshAnalysis() {
  const content = document.getElementById('content');
  content.innerHTML = '<div class="loading">Analyzing...</div>';

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_CHECKOUT_STATUS' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error:', chrome.runtime.lastError);
          displayStatus(null);
          return;
        }
        displayStatus(response);
      });
    }
  });
}

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  // First try to get from background
  chrome.runtime.sendMessage({ type: 'GET_TAB_STATUS' }, (response) => {
    if (response && (response.isCheckout || response.confidence > 0)) {
      displayStatus(response);
    } else {
      // If no data in background, request from content script
      refreshAnalysis();
    }
  });
});
