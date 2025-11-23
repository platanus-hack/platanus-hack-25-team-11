// Think twice - Popup script for managing user context

document.addEventListener('DOMContentLoaded', () => {
  const textarea = document.getElementById('userContext');
  const saveBtn = document.getElementById('saveBtn');
  const statusMessage = document.getElementById('statusMessage');

  const whitelistTextarea = document.getElementById('whitelist');
  const saveWhitelistBtn = document.getElementById('saveWhitelistBtn');
  const whitelistStatusMessage = document.getElementById('whitelistStatusMessage');

  // Load saved context and whitelist on popup open
  chrome.storage.local.get(['userContext', 'whitelist'], (result) => {
    if (result.userContext) {
      textarea.value = result.userContext;
    }
    if (result.whitelist) {
      whitelistTextarea.value = result.whitelist.join('\n');
    }
  });

  // Save context when button is clicked
  saveBtn.addEventListener('click', () => {
    const context = textarea.value.trim();

    if (!context) {
      showMessage(statusMessage, 'Please enter your context', 'error');
      return;
    }

    chrome.storage.local.set({ userContext: context }, () => {
      showMessage(statusMessage, 'Context saved successfully!', 'success');

      // Clear message after 2 seconds
      setTimeout(() => {
        statusMessage.className = 'status-message';
        statusMessage.textContent = '';
      }, 2000);
    });
  });

  // Save whitelist when button is clicked
  saveWhitelistBtn.addEventListener('click', () => {
    const whitelistText = whitelistTextarea.value.trim();
    const whitelist = whitelistText
      .split('\n')
      .map(domain => domain.trim())
      .filter(domain => domain.length > 0);

    chrome.storage.local.set({ whitelist: whitelist }, () => {
      showMessage(whitelistStatusMessage, 'Whitelist saved successfully!', 'success');

      // Clear message after 2 seconds
      setTimeout(() => {
        whitelistStatusMessage.className = 'status-message';
        whitelistStatusMessage.textContent = '';
      }, 2000);
    });
  });

  function showMessage(element, message, type) {
    element.textContent = message;
    element.className = `status-message ${type}`;
  }
});
