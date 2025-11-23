// Think twice - Popup script for managing user context

document.addEventListener('DOMContentLoaded', async () => {
  const textarea = document.getElementById('userContext');
  const saveBtn = document.getElementById('saveBtn');
  const statusMessage = document.getElementById('statusMessage');

  const whitelistTextarea = document.getElementById('whitelist');
  const saveWhitelistBtn = document.getElementById('saveWhitelistBtn');
  const whitelistStatusMessage = document.getElementById('whitelistStatusMessage');

  const extensionToggle = document.getElementById('extensionToggle');
  const toggleSwitch = extensionToggle.closest('.toggle-switch');

  // Load saved context, whitelist, and enabled state on popup open
  try {
    const result = await chrome.storage.local.get(['thinkTwiceUserContext', 'thinkTwiceWhitelist', 'thinkTwiceEnabled']);

    if (result.thinkTwiceUserContext) {
      textarea.value = result.thinkTwiceUserContext;
    }

    if (result.thinkTwiceWhitelist) {
      const whitelist = JSON.parse(result.thinkTwiceWhitelist);
      whitelistTextarea.value = whitelist.join('\n');
    }

    // Default to enabled if not set
    const isEnabled = result.thinkTwiceEnabled !== undefined ? result.thinkTwiceEnabled : true;
    extensionToggle.checked = isEnabled;

    // Enable animations after initial state is set
    requestAnimationFrame(() => {
      toggleSwitch.classList.add('animated');
    });
  } catch (e) {
    console.error('[Think twice] Error loading saved data:', e);
  }

  // Handle toggle change
  extensionToggle.addEventListener('change', async () => {
    try {
      const isEnabled = extensionToggle.checked;
      await chrome.storage.local.set({ thinkTwiceEnabled: isEnabled });
      console.log('[Think twice] Extension', isEnabled ? 'enabled' : 'disabled');
    } catch (e) {
      console.error('[Think twice] Error saving enabled state:', e);
    }
  });

  // Save context when button is clicked
  saveBtn.addEventListener('click', async () => {
    const context = textarea.value.trim();

    if (!context) {
      showMessage(statusMessage, 'Please enter your context', 'error');
      return;
    }

    try {
      await chrome.storage.local.set({ thinkTwiceUserContext: context });
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
  saveWhitelistBtn.addEventListener('click', async () => {
    const whitelistText = whitelistTextarea.value.trim();
    const whitelist = whitelistText
      .split('\n')
      .map(domain => domain.trim())
      .filter(domain => domain.length > 0);

    try {
      await chrome.storage.local.set({ thinkTwiceWhitelist: JSON.stringify(whitelist) });
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
