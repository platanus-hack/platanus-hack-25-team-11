# Think twice - Chrome Extension

A Chrome extension that helps you think twice before making online purchases by providing personalized prompts based on your cart contents and personal context.

## Features

- **Smart Interception**: Blocks navigation from cart to checkout pages
- **AI-Powered Questions**: Uses Claude AI to generate personalized questions based on your cart and context
- **User Context**: Configure your personal financial situation, goals, and priorities
- **Cooldown Period**: Shows alerts at most once every 5 minutes to avoid spam
- **Persistent Settings**: Your context is saved across browser sessions

## How It Works

1. Configure your personal context in the extension popup (income, family situation, financial goals, etc.)
2. When you try to proceed from cart to checkout, the extension intercepts the action
3. Sends your cart contents and personal context to an AI API
4. Shows you a personalized question to make you think twice about your purchase
5. You can then confirm or cancel the checkout

## Installation

### Development Mode

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked"
4. Select the `chrome-extension` directory
5. The extension should now be installed and active

### Icon Setup

Icons should be placed in the `icons/` directory:
- `icon16.png` (16x16px)
- `icon48.png` (48x48px)
- `icon128.png` (128x128px)

## Usage

### Setting Your Context

1. Click the extension icon in Chrome toolbar
2. Enter your personal context (example: "Soy Luis, gano 2000000 CLP al mes, tengo esposa e hijos")
3. Click "Save Context"

### Shopping Experience

1. Browse any e-commerce site and add items to your cart
2. When you click "Checkout" or similar buttons, the extension will:
   - Intercept the click
   - Send your cart HTML and context to the AI
   - Show a personalized confirmation dialog
3. Decide whether to proceed or cancel

### Debugging

To clear the 30-second cooldown for testing:
```javascript
chrome.storage.local.remove("checkoutBlockerLastAlert")
```

## Files Structure

```
chrome-extension/
├── manifest.json         # Extension configuration
├── content.js           # Main blocker logic and API integration
├── background.js        # Background service worker
├── popup.html           # Settings popup UI
├── popup.js             # Popup logic for saving context
├── icons/               # Extension icons
└── README.md            # This file
```

## Technical Details

### Content Script

The content script (`content.js`):
- Detects cart pages using URL patterns
- Intercepts clicks on checkout links/buttons
- Sends cart HTML to AI API with user context
- Shows personalized confirmation dialogs
- Manages 5-minute cooldown using localStorage

### API Integration

The extension makes POST requests to:
```
https://m9mjvirnlk.execute-api.us-east-1.amazonaws.com/Prod/consult
```

Payload:
```json
{
  "userContext": "Your saved context",
  "cartHTML": "HTML content from main tag"
}
```

Response:
```json
{
  "question": "Personalized question from AI",
  "tokensUsed": 123
}
```

### Detection Patterns

Cart pages detected by URL patterns:
- `/cart/i`, `/basket/i`, `/bag/i`
- `/carrito/i`, `/cesta/i` (Spanish)

Checkout links detected by URL patterns:
- `/checkout/i`, `/payment/i`, `/billing/i`, `/pay/i`
- `/paga/i`, `/pagar/i`, `/pago/i`, `/comprar/i` (Spanish)

## Permissions

The extension requires:
- `activeTab`: To analyze the current page
- `storage`: To persist user context
- `host_permissions`: To run on all websites

## Development

### Testing

1. Load extension in Chrome
2. Set your context in the popup
3. Visit any e-commerce site (e.g., Mercado Libre, Amazon)
4. Add items to cart and try to checkout
5. Check browser console for debug logs

### Console Logs

All logs are prefixed with `[Think twice]` for easy filtering.

## License

[Add your license here]
