console.log(chrome.webRequest)
chrome.webRequest.onCompleted.addListener(
    (details) => {
        if (details.statusCode == 200 && details.method == "PUT") {
            console.log(details.tabId, details.url, details)
            chrome.tabs.sendMessage(details.tabId, { type: "NewState" });
        }
    },
    { urls: ["https://*/*/state"] }
)