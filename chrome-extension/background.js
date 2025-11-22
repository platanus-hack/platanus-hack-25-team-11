// Background service worker for Go To Checkout Blocker

let checkoutStatus = new Map();

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'CHECKOUT_DETECTED') {
    handleCheckoutDetection(request.data, sender.tab);
  } else if (request.type === 'CHECKOUT_DATA') {
    handleCheckoutData(request.data, sender.tab);
  }
});

function handleCheckoutDetection(data, tab) {
  if (!tab || !tab.id) return;

  console.log('[Background] Checkout detection for tab', tab.id, data);

  // Store checkout status
  checkoutStatus.set(tab.id, {
    ...data,
    tabId: tab.id,
    tabUrl: tab.url,
    tabTitle: tab.title
  });


  // Store in chrome.storage for persistence
  chrome.storage.local.set({
    [`checkout_${tab.id}`]: data
  });
}

function handleCheckoutData(data, tab) {
  if (!tab || !tab.id) return;

  console.log('[Background] Checkout data for tab', tab.id, data);

  // Store detailed checkout data
  chrome.storage.local.set({
    [`checkout_data_${tab.id}`]: data
  });
}

// Clean up storage when tabs are closed
chrome.tabs.onRemoved.addListener((tabId) => {
  checkoutStatus.delete(tabId);
  chrome.storage.local.remove([`checkout_${tabId}`, `checkout_data_${tabId}`]);
});

// Handle tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    // Tab finished loading, wait for content script detection
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_TAB_STATUS') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        const status = checkoutStatus.get(tabs[0].id);
        sendResponse(status || { isCheckout: false, confidence: 0 });
      }
    });
    return true; // Will respond asynchronously
  }
});

console.log('[Background] Go To Checkout Blocker background script loaded');
