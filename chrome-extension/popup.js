// Think twice - Popup script for managing user context

document.addEventListener('DOMContentLoaded', () => {
  const textarea = document.getElementById('userContext');
  const saveBtn = document.getElementById('saveBtn');
  const statusMessage = document.getElementById('statusMessage');

  // Load saved context on popup open
  chrome.storage.local.get(['userContext'], (result) => {
    if (result.userContext) {
      textarea.value = result.userContext;
    }
  });

  // Save context when button is clicked
  saveBtn.addEventListener('click', () => {
    const context = textarea.value.trim();

    if (!context) {
      showMessage('Please enter your context', 'error');
      return;
    }

    chrome.storage.local.set({ userContext: context }, () => {
      showMessage('Context saved successfully!', 'success');

      // Clear message after 2 seconds
      setTimeout(() => {
        statusMessage.className = 'status-message';
        statusMessage.textContent = '';
      }, 2000);
    });
  });

  function showMessage(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
  }
});
