// Think twice content script

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
    this.ALERT_COOLDOWN = 30 * 1000; // 30 seconds in milliseconds
    this.loadLastAlertTime();
  }

  async loadLastAlertTime() {
    const result = await chrome.storage.local.get('checkoutBlockerLastAlert');
    if (result.checkoutBlockerLastAlert) {
      this.lastAlertTime = parseInt(result.checkoutBlockerLastAlert, 10);
      console.log('[Think twice] Loaded last alert time:', new Date(this.lastAlertTime));
    }
  }

  async saveLastAlertTime() {
    await chrome.storage.local.set({ checkoutBlockerLastAlert: this.lastAlertTime.toString() });
    console.log('[Think twice] Saved last alert time:', new Date(this.lastAlertTime));
  }

  canShowAlert() {
    const now = Date.now();
    if (now - this.lastAlertTime < this.ALERT_COOLDOWN) {
      console.log('[Think twice] Alert cooldown active, skipping');
      return false;
    }
    return true;
  }

  async getUserContext() {
    try {
      const result = await chrome.storage.local.get('thinkTwiceUserContext');
      return result.thinkTwiceUserContext || '';
    } catch (e) {
      console.error('[Think twice] Error getting user context:', e);
      return '';
    }
  }

  async getWhitelist() {
    try {
      const result = await chrome.storage.local.get('thinkTwiceWhitelist');
      return result.thinkTwiceWhitelist ? JSON.parse(result.thinkTwiceWhitelist) : [];
    } catch (e) {
      console.error('[Think twice] Error getting whitelist:', e);
      return [];
    }
  }

  async isWhitelisted() {
    try {
      const whitelist = await this.getWhitelist();
      const currentHostname = window.location.hostname;

      return whitelist.some(domain => {
        // Check if current hostname ends with the whitelisted domain
        // This allows subdomains (e.g., www.amazon.com matches amazon.com)
        return currentHostname === domain || currentHostname.endsWith('.' + domain);
      });
    } catch (e) {
      console.error('[Think twice] Error checking whitelist:', e);
      return false;
    }
  }

  reserveModalSpace() {
    // Save current scroll position and body styles
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    this.savedScrollY = window.scrollY;
    this.savedBodyOverflow = document.body.style.overflow;
    this.savedBodyPaddingRight = document.body.style.paddingRight;

    // Prevent body scroll and preserve scrollbar space
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  }

  releaseModalSpace() {
    // Restore body styles
    document.body.style.overflow = this.savedBodyOverflow || '';
    document.body.style.paddingRight = this.savedBodyPaddingRight || '';

    // Restore scroll position
    if (this.savedScrollY !== undefined) {
      window.scrollTo(0, this.savedScrollY);
    }
  }

  createVideoOverlay() {
    // Reserve space for modal
    this.reserveModalSpace();

    // Create overlay container
    const overlay = document.createElement('div');
    overlay.id = 'think-twice-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.25);
      z-index: 999999;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      opacity: 0;
      animation: fadeIn 0.5s ease-in forwards;
      gap: 2rem;
      overflow-y: auto;
    `;

    // Add keyframes animation
    if (!document.getElementById('think-twice-animation')) {
      const style = document.createElement('style');
      style.id = 'think-twice-animation';
      style.textContent = `
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes slideRight {
          from {
            transform: translateX(-200px);
          }
          to {
            transform: translateX(0);
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Create video element
    const video = document.createElement('video');
    video.style.cssText = `
      height: 400px;
      border-radius: 12px;
      pointer-events: none;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    `;
    video.autoplay = true;
    video.loop = false;
    video.muted = false;
    video.controls = false;
    video.disablePictureInPicture = true;
    video.controlsList = 'nodownload nofullscreen noremoteplayback';
    video.src = chrome.runtime.getURL('videos/pausito.mp4');

    // Prevent right-click on video
    video.addEventListener('contextmenu', (e) => e.preventDefault());

    // Create video container with side squares
    const videoContainer = document.createElement('div');
    videoContainer.style.cssText = `
      display: flex;
      align-items: center;
      gap: 0;
      width: 100%;
      transform: translateX(-200px);
      animation: slideRight 1.8s ease-in-out 0.6s forwards;
    `;

    // Create left square (extends from viewport edge to video edge + 200px overlap)
    const leftSquare = document.createElement('div');
    leftSquare.style.cssText = `
      background: rgb(226, 226, 229);
      flex: 1;
      height: 100%;
      margin-right: -160px;
      margin-left: -200px;
      z-index: 1;
    `;

    // Create right square (extends from video edge to viewport edge + 200px overlap)
    const rightSquare = document.createElement('div');
    rightSquare.style.cssText = `
      background: rgb(226, 226, 229);
      flex: 1;
      height: 100%;
      margin-left: -160px;
      margin-right: -200px;
      z-index: 1;
    `;

    // Match squares height to video after it loads
    video.addEventListener('loadedmetadata', () => {
      const videoHeight = video.offsetHeight;
      leftSquare.style.height = `${videoHeight}px`;
      rightSquare.style.height = `${videoHeight}px`;
    });

    videoContainer.appendChild(leftSquare);
    videoContainer.appendChild(video);
    videoContainer.appendChild(rightSquare);

    overlay.appendChild(videoContainer);
    // Add video container to overlay
    const modalContainer = document.createElement('div');
    modalContainer.id = 'think-twice-modal-container';
    modalContainer.style.cssText = `
      position: relative;
      width: 100%;
      height: 300px;
      display: flex;
      justify-content: center;
      align-items: center;
    `;
    overlay.appendChild(modalContainer);

    document.body.appendChild(overlay);

    return overlay;
  }

  createModal(message) {
    const modal = document.createElement('div');
    modal.id = 'think-twice-modal';
    modal.style.cssText = `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2.5rem;
      border-radius: 20px;
      max-width: 500px;
      width: 90%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      animation: slideUp 0.5s ease-out forwards;
      animation-delay: 0.3s;
      opacity: 0;
    `;

    const questionText = document.createElement('p');
    questionText.textContent = message;
    questionText.style.cssText = `
      color: white;
      font-size: 1.3rem;
      line-height: 1.6;
      margin-bottom: 2rem;
      text-align: center;
      font-weight: 500;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    `;

    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      display: flex;
      gap: 1rem;
      justify-content: center;
    `;

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.style.cssText = `
      padding: 1rem 2rem;
      border: 2px solid white;
      background: transparent;
      color: white;
      border-radius: 12px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 150px;
    `;
    cancelBtn.onmouseover = () => {
      cancelBtn.style.background = 'rgba(255, 255, 255, 0.1)';
      cancelBtn.style.transform = 'translateY(-2px)';
    };
    cancelBtn.onmouseout = () => {
      cancelBtn.style.background = 'transparent';
      cancelBtn.style.transform = 'translateY(0)';
    };

    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = 'Continuar';
    confirmBtn.style.cssText = `
      padding: 1rem 2rem;
      border: none;
      background: white;
      color: #667eea;
      border-radius: 12px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 150px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    `;
    confirmBtn.onmouseover = () => {
      confirmBtn.style.transform = 'translateY(-2px)';
      confirmBtn.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.3)';
    };
    confirmBtn.onmouseout = () => {
      confirmBtn.style.transform = 'translateY(0)';
      confirmBtn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
    };

    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(confirmBtn);

    modal.appendChild(questionText);
    modal.appendChild(buttonContainer);

    return { modal, confirmBtn, cancelBtn };
  }

  showCustomConfirm(message) {
    return new Promise((resolve) => {
      const overlay = document.getElementById('think-twice-overlay');
      if (!overlay) {
        resolve(false);
        return;
      }

      const { modal, confirmBtn, cancelBtn } = this.createModal(message);

      confirmBtn.onclick = () => {
        resolve(true);
      };

      cancelBtn.onclick = () => {
        resolve(false);
      };

      const modalContainer = document.getElementById('think-twice-modal-container');
      modalContainer.appendChild(modal);
    });
  }

  removeVideoOverlay() {
    const overlay = document.getElementById('think-twice-overlay');
    if (overlay) {
      overlay.remove();
    }
    // Release reserved modal space
    this.releaseModalSpace();
  }

  async showAlert() {
    if (!this.canShowAlert()) {
      return true;
    }

    // Get user context from storage
    const userContext = await this.getUserContext();

    // Show video overlay while waiting
    this.createVideoOverlay();
    const videoStartTime = Date.now();

    // Make API request
    try {
      const mainHtml = this.getMainContent();
      const payload = {
        userContext: userContext,
        cartHTML: mainHtml
      };

      console.log('[Think twice] Making API request...');
      console.log('[Think twice] User context:', userContext);
      const response = await fetch('https://m9mjvirnlk.execute-api.us-east-1.amazonaws.com/Prod/consult', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('[Think twice] API response:', data);

      // Use the question from API if available, otherwise use default
      const alertMessage = data.question || '¿Estás seguro que quieres gastar tu dinero en estupideces?';

      // Wait until exactly 5 seconds have passed since video started
      const elapsedTime = Date.now() - videoStartTime;
      const remainingTime = 5000 - elapsedTime;
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }

      const confirmed = await this.showCustomConfirm(alertMessage);

      // Remove video overlay after user responds
      this.removeVideoOverlay();

      this.lastAlertTime = Date.now();
      this.saveLastAlertTime();
      console.log('[Think twice] Alert shown at', new Date(this.lastAlertTime));
      return confirmed;
    } catch (error) {
      console.error('[Think twice] API request failed:', error);

      // Wait until exactly 5 seconds have passed since video started
      const elapsedTime = Date.now() - videoStartTime;
      const remainingTime = 5000 - elapsedTime;
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }

      // Fallback to default message if API fails
      const confirmed = await this.showCustomConfirm('¿Estás seguro que quieres gastar tu dinero en estupideces?');

      // Remove video overlay after user responds
      this.removeVideoOverlay();

      this.lastAlertTime = Date.now();
      this.saveLastAlertTime();
      console.log('[Think twice] Alert shown at', new Date(this.lastAlertTime));
      return confirmed;
    }
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
    let html = document.body.innerHTML;
    // Remove src attributes, class attributes, style, script and svg tags
    html = html
      .replace(/\ssrc="[^"]*"/gi, '')
      .replace(/\sclass="[^"]*"/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, '');

    return html;
  }

  // Intercept clicks on checkout links/buttons from cart pages
  setupClickInterception() {
    console.log('[Think twice] Setting up click interception');

    document.addEventListener('click', (e) => {
      try {
        // Check if this is a confirmed click that should bypass interception
        let checkTarget = e.target;
        while (checkTarget && checkTarget !== document.body) {
          if (checkTarget.getAttribute && checkTarget.getAttribute('data-think-twice-confirmed') === 'true') {
            console.log('[Think twice] Bypassing interception for confirmed action');
            return;
          }
          checkTarget = checkTarget.parentElement;
        }

        // Only intercept on cart pages
        const isCart = this.isCartPage();
        console.log('[Think twice] Is cart page?', isCart, 'URL:', window.location.href);
        if (!isCart) return;

        // Traverse up to find if we clicked on a checkout link or button
        console.log('[Think twice] Checking target:', e.target);
        let target = e.target;
        while (target && target !== document.body) {
          // Check if it's a link (anchor tag)
          if (target.tagName === 'A' && target.href) {
            console.log('[Think twice] Found link:', target.href);
            if (this.isCheckoutLink(target.href)) {
              // MUST prevent default synchronously
              e.preventDefault();
              e.stopPropagation();
              e.stopImmediatePropagation();

              // Log body content
              const mainHtml = this.getMainContent();
              console.log('[Think twice] Intercepted checkout link');
              console.log('[Think twice] Body content:', mainHtml);
              console.log('[Think twice] Link href:', target.href);

              // Handle async logic separately
              this.handleCheckoutLink(target.href);
              return false;
            }
          }

          // Check if it's a button
          if (target.tagName === 'BUTTON' || target.getAttribute('role') === 'button') {
            const buttonText = target.textContent.toLowerCase();
            console.log('[Think twice] Found button:', buttonText);
            if (this.checkoutPatterns.some(pattern => pattern.test(buttonText))) {
              // MUST prevent default synchronously
              e.preventDefault();
              e.stopPropagation();
              e.stopImmediatePropagation();

              // Log body content
              const mainHtml = this.getMainContent();
              console.log('[Think twice] Intercepted checkout button');
              console.log('[Think twice] Body content:', mainHtml);
              console.log('[Think twice] Button text:', buttonText);

              // Handle async logic separately
              this.handleCheckoutButton(target);
              return false;
            }
          }

          target = target.parentElement;
        }
      } catch (error) {
        console.error('[Think twice] Error in click handler:', error);
      }
    }, true); // Use capture phase

    console.log('[Think twice] Click interception ready');
  }

  async handleCheckoutLink(href) {
    try {
      // Check if site is whitelisted
      if (await this.isWhitelisted()) {
        console.log('[Think twice] Site is whitelisted, navigating to:', href);
        window.location.href = href;
        return;
      }

      const confirmed = await this.showAlert();
      if (confirmed) {
        console.log('[Think twice] User confirmed, navigating to:', href);
        window.location.href = href;
      } else {
        console.log('[Think twice] User cancelled');
      }
    } catch (error) {
      console.error('[Think twice] Error in handleCheckoutLink:', error);
    }
  }

  async handleCheckoutButton(button) {
    try {
      // Check if site is whitelisted
      if (await this.isWhitelisted()) {
        console.log('[Think twice] Site is whitelisted, clicking button');
        button.setAttribute('data-think-twice-confirmed', 'true');
        button.click();
        setTimeout(() => button.removeAttribute('data-think-twice-confirmed'), 100);
        return;
      }

      const confirmed = await this.showAlert();
      if (confirmed) {
        console.log('[Think twice] User confirmed button click');
        // Temporarily mark this button to bypass interception
        button.setAttribute('data-think-twice-confirmed', 'true');
        // Trigger the button click
        button.click();
        // Clean up the marker after a short delay
        setTimeout(() => {
          button.removeAttribute('data-think-twice-confirmed');
        }, 100);
      } else {
        console.log('[Think twice] User cancelled');
      }
    } catch (error) {
      console.error('[Think twice] Error in handleCheckoutButton:', error);
    }
  }

  init() {
    console.log('[Think twice] Initializing...');

    // Set up click interception immediately
    if (document.body) {
      this.setupClickInterception();
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        this.setupClickInterception();
      });
    }

    console.log('[Think twice] Initialized');
  }
}

// Initialize blocker
const blocker = new CheckoutBlocker();
blocker.init();

// Log helper message
console.log('[Think twice] Helper commands:');
console.log('  Clear cooldown: chrome.storage.local.remove("checkoutBlockerLastAlert")');
console.log('  Clear context: chrome.storage.local.remove("thinkTwiceUserContext")');
console.log('  Clear whitelist: chrome.storage.local.remove("thinkTwiceWhitelist")');
