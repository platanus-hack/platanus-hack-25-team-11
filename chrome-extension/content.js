// Go To Checkout Blocker content script

class CheckoutBlocker {
  constructor() {
    // Patterns to detect checkout URLs and links
    this.checkoutPatterns = [
      /checkout/i,
      /payment/i,
      /billing/i,
      /pay/i,
      /paga/i,
      /pagar/i,
      /pago/i,
      /comprar/i,
      /orden/i,
      /order/i
    ];

    // Patterns to detect cart pages
    this.cartPatterns = [
      /cart/i,
      /basket/i,
      /bag/i,
      /carrito/i,
      /cesta/i
    ];

    this.lastAlertTime = 0;
    this.ALERT_COOLDOWN = 5 * 60 * 1000; // 5 minutes in milliseconds
    this.loadLastAlertTime();
  }

  loadLastAlertTime() {
    const saved = localStorage.getItem('checkoutBlockerLastAlert');
    if (saved) {
      this.lastAlertTime = parseInt(saved, 10);
      console.log('[CheckoutBlocker] Loaded last alert time:', new Date(this.lastAlertTime));
    }
  }

  saveLastAlertTime() {
    localStorage.setItem('checkoutBlockerLastAlert', this.lastAlertTime.toString());
    console.log('[CheckoutBlocker] Saved last alert time:', new Date(this.lastAlertTime));
  }

  canShowAlert() {
    const now = Date.now();
    if (now - this.lastAlertTime < this.ALERT_COOLDOWN) {
      console.log('[CheckoutBlocker] Alert cooldown active, skipping');
      return false;
    }
    return true;
  }

  async showAlert() {
    if (!this.canShowAlert()) {
      return true;
    }

    // Make API request
    try {
      const mainHtml = this.getMainContent();
      const payload = {
        userContext: "soy luis gano 2000000Clp al mes tengo esposa e hijos",
        cartHTML: mainHtml
      };

      console.log('[CheckoutBlocker] Making API request...');
      const response = await fetch('https://m9mjvirnlk.execute-api.us-east-1.amazonaws.com/Prod/consult', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('[CheckoutBlocker] API response:', data);
    } catch (error) {
      console.error('[CheckoutBlocker] API request failed:', error);
    }

    const confirmed = confirm('¿Estás seguro que quieres gastar tu dinero en estupideces?');
    this.lastAlertTime = Date.now();
    this.saveLastAlertTime();
    console.log('[CheckoutBlocker] Alert shown at', new Date(this.lastAlertTime));
    return confirmed;
  }

  isCartPage() {
    const url = window.location.href.toLowerCase();
    return this.cartPatterns.some(pattern => pattern.test(url));
  }

  isCheckoutLink(url) {
    if (!url) return false;
    const urlLower = url.toLowerCase();
    return this.checkoutPatterns.some(pattern => pattern.test(urlLower));
  }

  getMainContent() {
    const mainTag = document.querySelector('main');
    if (!mainTag) {
      return 'No main tag found';
    }

    let html = mainTag.innerHTML;
    // Remove src attributes, style and script tags
    html = html
      .replace(/\ssrc="[^"]*"/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

    return html;
  }

  // Intercept clicks on checkout links/buttons from cart pages
  setupClickInterception() {
    console.log('[CheckoutBlocker] Setting up click interception');

    document.addEventListener('click', async (e) => {
      // Only intercept on cart pages
      if (!this.isCartPage()) return;

      // Traverse up to find if we clicked on a checkout link or button
      let target = e.target;
      while (target && target !== document.body) {
        // Check if it's a link (anchor tag)
        if (target.tagName === 'A' && target.href) {
          if (this.isCheckoutLink(target.href)) {
            // Log main tag content
            const mainHtml = this.getMainContent();
            console.log('[CheckoutBlocker] Intercepted checkout link');
            console.log('[CheckoutBlocker] Main tag content:', mainHtml);
            console.log('[CheckoutBlocker] Link href:', target.href);

            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            const confirmed = await this.showAlert();
            if (confirmed) {
              console.log('[CheckoutBlocker] User confirmed, navigating to:', target.href);
              window.location.href = target.href;
            } else {
              console.log('[CheckoutBlocker] User cancelled');
            }
            return false;
          }
        }

        // Check if it's a button
        if (target.tagName === 'BUTTON' || target.getAttribute('role') === 'button') {
          const buttonText = target.textContent.toLowerCase();
          if (this.checkoutPatterns.some(pattern => pattern.test(buttonText))) {
            // Log main tag content
            const mainHtml = this.getMainContent();
            console.log('[CheckoutBlocker] Intercepted checkout button');
            console.log('[CheckoutBlocker] Main tag content:', mainHtml);
            console.log('[CheckoutBlocker] Button text:', buttonText);

            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            const confirmed = await this.showAlert();
            if (!confirmed) {
              console.log('[CheckoutBlocker] User cancelled');
              return false;
            }
            // If confirmed, let the button's original action proceed
            console.log('[CheckoutBlocker] User confirmed button click');
          }
        }

        target = target.parentElement;
      }
    }, true); // Use capture phase

    console.log('[CheckoutBlocker] Click interception ready');
  }



  init() {
    console.log('[CheckoutBlocker] Initializing...');

    // Set up click interception immediately
    if (document.body) {
      this.setupClickInterception();
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        this.setupClickInterception();
      });
    }

    console.log('[CheckoutBlocker] Initialized');
  }
}

// Initialize blocker
const blocker = new CheckoutBlocker();
blocker.init();

// Log helper message
console.log('[CheckoutBlocker] To clear cooldown, run: localStorage.removeItem("checkoutBlockerLastAlert")');
