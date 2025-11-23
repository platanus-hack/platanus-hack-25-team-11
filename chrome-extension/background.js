// Background service worker for Think twice

let checkoutStatus = new Map();

// Initialize icon state on startup
chrome.runtime.onInstalled.addListener(() => {
  updateIcon();
});

chrome.runtime.onStartup.addListener(() => {
  updateIcon();
});

// Listen for storage changes to update icon
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.thinkTwiceEnabled) {
    updateIcon();
  }
});

async function updateIcon() {
  const result = await chrome.storage.local.get('thinkTwiceEnabled');
  const isEnabled = result.thinkTwiceEnabled !== undefined ? result.thinkTwiceEnabled : true;

  if (isEnabled) {
    // Set to normal colored icon
    chrome.action.setIcon({
      path: {
        16: 'icons/icon16.png',
        48: 'icons/icon48.png',
        128: 'icons/icon128.png'
      }
    });
  } else {
    // Convert to greyscale
    await setGreyscaleIcon();
  }
}

async function setGreyscaleIcon() {
  const sizes = [16, 48, 128];
  const imageData = {};

  for (const size of sizes) {
    try {
      // Fetch the icon image
      const response = await fetch(chrome.runtime.getURL(`icons/icon${size}.png`));
      const blob = await response.blob();
      const imageBitmap = await createImageBitmap(blob);

      // Create canvas and draw image
      const canvas = new OffscreenCanvas(size, size);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(imageBitmap, 0, 0, size, size);

      // Get image data and convert to greyscale
      const imgData = ctx.getImageData(0, 0, size, size);
      const pixels = imgData.data;

      for (let i = 0; i < pixels.length; i += 4) {
        const grey = pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114;
        pixels[i] = grey;
        pixels[i + 1] = grey;
        pixels[i + 2] = grey;
      }

      imageData[size] = imgData;
    } catch (error) {
      console.error(`[Think twice] Error creating greyscale icon for size ${size}:`, error);
    }
  }

  chrome.action.setIcon({ imageData });
}

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

  console.log('[Think twice] Checkout detection for tab', tab.id, data);

  // Store checkout status
  checkoutStatus.set(tab.id, {
    ...data,
    tabId: tab.id,
    tabUrl: tab.url,
    tabTitle: tab.title
  });
}

function handleCheckoutData(data, tab) {
  if (!tab || !tab.id) return;

  console.log('[Think twice] Checkout data for tab', tab.id, data);
}

// Clean up storage when tabs are closed
chrome.tabs.onRemoved.addListener((tabId) => {
  checkoutStatus.delete(tabId);
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

console.log('[Background] Think twice background script loaded');
