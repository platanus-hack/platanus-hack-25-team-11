# Checkout Detector Chrome Extension

A Chrome extension that automatically detects checkout pages on e-commerce websites by analyzing page content, URLs, form fields, and other indicators.

## Features

- **Automatic Detection**: Continuously monitors pages to identify checkout processes
- **Confidence Scoring**: Provides a confidence percentage based on multiple detection indicators
- **Real-time Analysis**: Uses MutationObserver to detect dynamically loaded checkout forms
- **Visual Feedback**: Badge indicator on extension icon when checkout is detected
- **Detailed Reporting**: Shows which indicators triggered the detection

## Detection Methods

The extension uses multiple heuristics to identify checkout pages:

1. **URL Patterns**: Checks for keywords like "checkout", "cart", "payment", "billing"
2. **Form Fields**: Detects credit card, CVV, billing address inputs
3. **Page Content**: Searches for text like "Place Order", "Complete Purchase"
4. **HTML Selectors**: Identifies common e-commerce payment form elements

## Installation

### Development Mode

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked"
4. Select the `chrome-extension` directory
5. The extension should now be installed and active

### Icon Setup

Before loading the extension, you need to add icon files to the `icons/` directory:
- `icon16.png` (16x16px)
- `icon48.png` (48x48px)
- `icon128.png` (128x128px)

You can create simple placeholder icons or use proper ones for your project.

## Usage

1. Navigate to any website
2. Click the extension icon in your Chrome toolbar
3. The popup will show:
   - Detection status (Checkout Detected / No Checkout Detected)
   - Confidence percentage
   - Breakdown of detection indicators
   - Current page URL

4. Click "Refresh Analysis" to re-analyze the current page

### Badge Indicator

When a checkout page is detected with high confidence, the extension icon will display a red "!" badge.

## Technical Details

### Files Structure

```
chrome-extension/
├── manifest.json         # Extension configuration
├── content.js           # Content script that analyzes pages
├── background.js        # Service worker for handling events
├── popup.html           # Popup UI
├── popup.js             # Popup logic
├── icons/               # Extension icons
└── README.md            # This file
```

### Content Script

The content script (`content.js`) runs on every page and performs detection using the `CheckoutDetector` class. It:
- Analyzes URL, form fields, text content, and HTML elements
- Calculates a confidence score (0-100)
- Sends results to the background service worker
- Monitors DOM changes for dynamic content

### Background Service Worker

The background script (`background.js`):
- Receives detection results from content scripts
- Updates extension badge and shows notifications
- Stores checkout data in chrome.storage
- Manages state across tabs

### Popup

The popup interface displays:
- Real-time checkout detection status
- Visual confidence indicator
- Breakdown of detection signals
- Manual refresh capability

## Development

### Testing

To test the extension:

1. Load the extension in Chrome
2. Visit known checkout pages (e.g., Amazon checkout, Shopify stores)
3. Open the extension popup to see detection results
4. Check the browser console for debug logs

### Debugging

- Content script logs: Open DevTools on the page (F12)
- Background script logs: Go to `chrome://extensions/` → Click "Service Worker" link
- Popup logs: Right-click popup → "Inspect"

## Customization

### Adjusting Detection Sensitivity

Edit the scoring values in `content.js`:
- URL patterns: Currently 15 points per match (max 40)
- Form fields: 10 points per field (max 40)
- Text content: 5 points per match (max 30)
- Selectors: 8 points per element (max 40)

The threshold for `isCheckout` is currently 30% confidence.

### Adding New Detection Patterns

In `content.js`, modify the `checkoutIndicators` object to add:
- New URL patterns
- Additional form field names
- More text patterns
- Custom CSS selectors

## Permissions

The extension requires:
- `activeTab`: To analyze the current page
- `storage`: To persist detection results
- `notifications`: To alert users of high-confidence detections
- `host_permissions`: To run on all websites

## Future Enhancements

Potential improvements:
- Machine learning-based detection
- Platform-specific detection (Shopify, WooCommerce, etc.)
- Historical tracking of visited checkouts
- Integration with external APIs
- Custom detection rules

## License

[Add your license here]
