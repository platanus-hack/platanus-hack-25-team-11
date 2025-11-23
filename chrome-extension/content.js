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
    this.ALERT_COOLDOWN = 5 * 60 * 1000; // 5 minutes in milliseconds
    this.loadLastAlertTime();
  }

  loadLastAlertTime() {
    const saved = localStorage.getItem('checkoutBlockerLastAlert');
    if (saved) {
      this.lastAlertTime = parseInt(saved, 10);
      console.log('[Think twice] Loaded last alert time:', new Date(this.lastAlertTime));
    }
  }

  saveLastAlertTime() {
    localStorage.setItem('checkoutBlockerLastAlert', this.lastAlertTime.toString());
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

  getUserContext() {
    try {
      return localStorage.getItem('thinkTwiceUserContext') || '';
    } catch (e) {
      console.error('[Think twice] Error getting user context:', e);
      return '';
    }
  }

  getWhitelist() {
    try {
      const saved = localStorage.getItem('thinkTwiceWhitelist');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('[Think twice] Error getting whitelist:', e);
      return [];
    }
  }

  isWhitelisted() {
    try {
      const whitelist = this.getWhitelist();
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
    const userContext = this.getUserContext();

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

    document.addEventListener('click', async (e) => {
      // Check if this is a confirmed click that should bypass interception
      let checkTarget = e.target;
      while (checkTarget && checkTarget !== document.body) {
        if (checkTarget.getAttribute && checkTarget.getAttribute('data-think-twice-confirmed') === 'true') {
          console.log('[Think twice] Bypassing interception for confirmed action');
          return;
        }
        checkTarget = checkTarget.parentElement;
      }

      // Check if site is whitelisted
      if (this.isWhitelisted()) {
        console.log('[Think twice] Site is whitelisted, skipping interception');
        return;
      }

      // Only intercept on cart pages
      if (!this.isCartPage()) return;

      // Traverse up to find if we clicked on a checkout link or button
      let target = e.target;
      while (target && target !== document.body) {
        // Check if it's a link (anchor tag)
        if (target.tagName === 'A' && target.href) {
          if (this.isCheckoutLink(target.href)) {
            // Log body content
            const mainHtml = this.getMainContent();
            console.log('[Think twice] Intercepted checkout link');
            console.log('[Think twice] Body content:', mainHtml);
            console.log('[Think twice] Link href:', target.href);

            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            const confirmed = await this.showAlert();
            if (confirmed) {
              console.log('[Think twice] User confirmed, navigating to:', target.href);
              window.location.href = target.href;
            } else {
              console.log('[Think twice] User cancelled');
            }
            return false;
          }
        }

        // Check if it's a button
        if (target.tagName === 'BUTTON' || target.getAttribute('role') === 'button') {
          const buttonText = target.textContent.toLowerCase();
          if (this.checkoutPatterns.some(pattern => pattern.test(buttonText))) {
            // Log body content
            const mainHtml = this.getMainContent();
            console.log('[Think twice] Intercepted checkout button');
            console.log('[Think twice] Body content:', mainHtml);
            console.log('[Think twice] Button text:', buttonText);

            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            const confirmed = await this.showAlert();
            if (!confirmed) {
              console.log('[Think twice] User cancelled');
              return false;
            }
            // If confirmed, trigger the button's action
            console.log('[Think twice] User confirmed button click');

            // Temporarily mark this button to bypass interception
            target.setAttribute('data-think-twice-confirmed', 'true');

            // Trigger the button click
            target.click();

            // Clean up the marker after a short delay
            setTimeout(() => {
              target.removeAttribute('data-think-twice-confirmed');
            }, 100);

            return false;
          }
        }

        target = target.parentElement;
      }
    }, true); // Use capture phase

    console.log('[Think twice] Click interception ready');
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
console.log('  Clear cooldown: localStorage.removeItem("checkoutBlockerLastAlert")');
console.log('  Clear context: localStorage.removeItem("thinkTwiceUserContext")');
console.log('  Clear whitelist: localStorage.removeItem("thinkTwiceWhitelist")');
