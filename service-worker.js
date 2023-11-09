let request_id = undefined
chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
        if (details.requestBody.error === undefined) {
            const text_decoder = new TextDecoder()
            const decoded = text_decoder.decode(details.requestBody.raw[0].bytes)
            const obj = JSON.parse(decoded)

            if (obj.debug_source == "started_playing") {
                request_id = details.requestId
            }
        }
    },
    { urls: ["https://*spotify.com/*/state"] },
    ["requestBody"],
)

chrome.webRequest.onCompleted.addListener(
    (details) => {
        if (details.statusCode == 200 && request_id === details.requestId) {
            chrome.tabs.sendMessage(details.tabId, { type: "NewState" });
        }
    },
    { urls: ["https://*spotify.com/*/state"] }
)