chrome.runtime.onInstalled.addListener(() => {
    chrome.action.setBadgeBackgroundColor({ color: '#4688F1' });
    console.log("Extension installed");
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && /^http/.test(tab.url)) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        });
    }
});
