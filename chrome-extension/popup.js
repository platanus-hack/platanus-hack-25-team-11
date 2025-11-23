// Think twice - Popup script for managing user context

document.addEventListener('DOMContentLoaded', () => {
  const textarea = document.getElementById('userContext');
  const saveBtn = document.getElementById('saveBtn');
  const statusMessage = document.getElementById('statusMessage');

  const whitelistTextarea = document.getElementById('whitelist');
  const saveWhitelistBtn = document.getElementById('saveWhitelistBtn');
  const whitelistStatusMessage = document.getElementById('whitelistStatusMessage');

  // Load saved context and whitelist on popup open
  try {
    const savedContext = localStorage.getItem('thinkTwiceUserContext');
    if (savedContext) {
      textarea.value = savedContext;
    }

    const savedWhitelist = localStorage.getItem('thinkTwiceWhitelist');
    if (savedWhitelist) {
      const whitelist = JSON.parse(savedWhitelist);
      whitelistTextarea.value = whitelist.join('\n');
    }
  } catch (e) {
    console.error('[Think twice] Error loading saved data:', e);
  }

  // Save context when button is clicked
  saveBtn.addEventListener('click', () => {
    const context = textarea.value.trim();

    if (!context) {
      showMessage(statusMessage, 'Please enter your context', 'error');
      return;
    }

    try {
      localStorage.setItem('thinkTwiceUserContext', context);
      showMessage(statusMessage, 'Context saved successfully!', 'success');

      // Clear message after 2 seconds
      setTimeout(() => {
        statusMessage.className = 'status-message';
        statusMessage.textContent = '';
      }, 2000);
    } catch (e) {
      console.error('[Think twice] Error saving context:', e);
      showMessage(statusMessage, 'Error saving context', 'error');
    }
  });

  // Save whitelist when button is clicked
  saveWhitelistBtn.addEventListener('click', () => {
    const whitelistText = whitelistTextarea.value.trim();
    const whitelist = whitelistText
      .split('\n')
      .map(domain => domain.trim())
      .filter(domain => domain.length > 0);

    try {
      localStorage.setItem('thinkTwiceWhitelist', JSON.stringify(whitelist));
      showMessage(whitelistStatusMessage, 'Whitelist saved successfully!', 'success');

      // Clear message after 2 seconds
      setTimeout(() => {
        whitelistStatusMessage.className = 'status-message';
        whitelistStatusMessage.textContent = '';
      }, 2000);
    } catch (e) {
      console.error('[Think twice] Error saving whitelist:', e);
      showMessage(whitelistStatusMessage, 'Error saving whitelist', 'error');
    }
  });

  function showMessage(element, message, type) {
    element.textContent = message;
    element.className = `status-message ${type}`;
  }
});
