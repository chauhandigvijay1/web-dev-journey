document.getElementById("save-job-btn").addEventListener("click", async () => {
  const statusMsg = document.getElementById("status-msg");
  statusMsg.textContent = "Scraping page...";

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Request content script to parse page
    chrome.tabs.sendMessage(tab.id, { action: "PARSE_JOB" }, async (response) => {
      if (!response || !response.success) {
        statusMsg.textContent = "Failed to parse job. Is this a supported job board?";
        return;
      }

      statusMsg.textContent = "Saving to JobPilot...";
      
      // We would normally send this to the background script to securely API post
      chrome.runtime.sendMessage({ action: "SAVE_JOB", payload: response.data }, (bgRes) => {
        if (bgRes && bgRes.success) {
          statusMsg.textContent = "Job saved successfully!";
        } else {
          statusMsg.textContent = "Error saving job. Are you logged in?";
        }
      });
    });
  } catch (error) {
    statusMsg.textContent = "An error occurred.";
    console.error(error);
  }
});
