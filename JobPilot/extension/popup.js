function parseActiveTab(tabId) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, { action: "PARSE_JOB" }, async (response) => {
      if (chrome.runtime.lastError) {
        try {
          await chrome.scripting.executeScript({
            target: { tabId },
            files: ["content.js"],
          });
        } catch {
          resolve(null);
          return;
        }

        chrome.tabs.sendMessage(tabId, { action: "PARSE_JOB" }, (retryResponse) => {
          if (chrome.runtime.lastError) {
            resolve(null);
            return;
          }
          resolve(retryResponse);
        });
        return;
      }

      resolve(response);
    });
  });
}

document.getElementById("save-job-btn").addEventListener("click", async () => {
  const statusMsg = document.getElementById("status-msg");
  statusMsg.textContent = "Scraping page...";

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    const response = await parseActiveTab(tab.id);
    if (!response || !response.success || !response.data?.title) {
      statusMsg.textContent = "Failed to parse job. Is this a supported job board?";
      return;
    }

    statusMsg.textContent = "Saving to JobPilot...";

    chrome.runtime.sendMessage({ action: "SAVE_JOB", payload: response.data }, (bgRes) => {
      if (bgRes && bgRes.success) {
        statusMsg.textContent = "Job saved successfully!";
      } else {
        statusMsg.textContent = bgRes?.message || "Error saving job. Are you logged in?";
      }
    });
  } catch (error) {
    statusMsg.textContent = "An error occurred.";
    console.error(error);
  }
});
