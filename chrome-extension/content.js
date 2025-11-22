// Checkout detection content script

class CheckoutDetector {
  constructor() {
    this.checkoutIndicators = {
      urlPatterns: [
        /checkout/i,
        /cart/i,
        /payment/i,
        /billing/i,
        /order/i,
        /purchase/i,
        /pay/i
      ],
      formFields: [
        'credit-card',
        'card-number',
        'cvv',
        'cvc',
        'billing-address',
        'shipping-address',
        'cardholder',
        'expiry',
        'card_number',
        'cc-number'
      ],
      textPatterns: [
        /place\s+order/i,
        /complete\s+purchase/i,
        /pay\s+now/i,
        /checkout/i,
        /confirm\s+order/i,
        /submit\s+payment/i,
        /billing\s+information/i,
        /payment\s+method/i,
        /credit\s+card/i,
        /debit\s+card/i
      ],
      selectors: [
        '[name*="card"]',
        '[id*="card"]',
        '[name*="payment"]',
        '[id*="payment"]',
        '[name*="billing"]',
        '[id*="billing"]',
        'input[type="tel"][maxlength="16"]',
        'input[type="tel"][maxlength="19"]',
        'input[autocomplete="cc-number"]',
        'input[autocomplete="cc-exp"]',
        'input[autocomplete="cc-csc"]'
      ]
    };
  }

  detectCheckout() {
    const results = {
      isCheckout: false,
      confidence: 0,
      indicators: [],
      timestamp: new Date().toISOString(),
      url: window.location.href
    };

    // Check URL
    const urlScore = this.checkURL();
    if (urlScore > 0) {
      results.indicators.push({ type: 'url', score: urlScore });
      results.confidence += urlScore;
    }

    // Check form fields
    const formScore = this.checkFormFields();
    if (formScore > 0) {
      results.indicators.push({ type: 'form_fields', score: formScore });
      results.confidence += formScore;
    }

    // Check page text
    const textScore = this.checkPageText();
    if (textScore > 0) {
      results.indicators.push({ type: 'text_content', score: textScore });
      results.confidence += textScore;
    }

    // Check specific selectors
    const selectorScore = this.checkSelectors();
    if (selectorScore > 0) {
      results.indicators.push({ type: 'selectors', score: selectorScore });
      results.confidence += selectorScore;
    }

    // Normalize confidence to 0-100
    results.confidence = Math.min(100, results.confidence);
    results.isCheckout = results.confidence > 30;

    return results;
  }

  checkURL() {
    const url = window.location.href.toLowerCase();
    let score = 0;

    for (const pattern of this.checkoutIndicators.urlPatterns) {
      if (pattern.test(url)) {
        score += 15;
      }
    }

    return Math.min(40, score);
  }

  checkFormFields() {
    let score = 0;
    const inputs = document.querySelectorAll('input');

    inputs.forEach(input => {
      const name = (input.name || '').toLowerCase();
      const id = (input.id || '').toLowerCase();
      const autocomplete = (input.autocomplete || '').toLowerCase();

      for (const field of this.checkoutIndicators.formFields) {
        if (name.includes(field) || id.includes(field) || autocomplete.includes(field)) {
          score += 10;
          break;
        }
      }
    });

    return Math.min(40, score);
  }

  checkPageText() {
    const bodyText = document.body.innerText;
    let score = 0;

    for (const pattern of this.checkoutIndicators.textPatterns) {
      if (pattern.test(bodyText)) {
        score += 5;
      }
    }

    return Math.min(30, score);
  }

  checkSelectors() {
    let score = 0;

    for (const selector of this.checkoutIndicators.selectors) {
      try {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          score += 8;
        }
      } catch (e) {
        // Invalid selector, skip
      }
    }

    return Math.min(40, score);
  }

  extractCheckoutData() {
    if (!this.detectCheckout().isCheckout) {
      return null;
    }

    const data = {
      url: window.location.href,
      title: document.title,
      forms: [],
      timestamp: new Date().toISOString()
    };

    // Extract form information
    const forms = document.querySelectorAll('form');
    forms.forEach((form, index) => {
      const formData = {
        index,
        action: form.action,
        method: form.method,
        fields: []
      };

      const inputs = form.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        formData.fields.push({
          type: input.type || input.tagName.toLowerCase(),
          name: input.name,
          id: input.id,
          placeholder: input.placeholder,
          required: input.required
        });
      });

      if (formData.fields.length > 0) {
        data.forms.push(formData);
      }
    });

    return data;
  }
}

// Initialize detector
const detector = new CheckoutDetector();

// Run detection on page load
function runDetection() {
  const result = detector.detectCheckout();

  console.log('[Checkout Detector] Analysis:', result);

  // Send result to background script
  chrome.runtime.sendMessage({
    type: 'CHECKOUT_DETECTED',
    data: result
  });

  // If checkout detected, extract additional data
  if (result.isCheckout) {
    const checkoutData = detector.extractCheckoutData();
    chrome.runtime.sendMessage({
      type: 'CHECKOUT_DATA',
      data: checkoutData
    });
  }
}

// Run immediately
runDetection();

// Watch for dynamic content changes
const observer = new MutationObserver(() => {
  runDetection();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_CHECKOUT_STATUS') {
    const result = detector.detectCheckout();
    sendResponse(result);
  }
  return true;
});
