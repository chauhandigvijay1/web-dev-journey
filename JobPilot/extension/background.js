// JobPilot Companion Background Service Worker

const API_URL = "http://localhost:5000/api";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "SAVE_JOB") {
    // In production, we would use chrome.storage to get a JWT token
    // and send a POST request to our API
    console.log("Saving job payload to JobPilot API...", request.payload);
    
    // Simulate API call for now
    setTimeout(() => {
      sendResponse({ success: true, message: "Job saved" });
    }, 1000);
    
    return true; // Keep message channel open for async response
  }
});
