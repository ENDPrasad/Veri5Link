chrome.runtime.onMessage.addListener(async (msg, sender) => {
  if (msg.action === "checkUrls") {
    const { urls, tabId } = msg;
    const results = [];
    let checked = 0;

    for (const url of urls) {
      let type = "unknown";
      let status = "";
      try {
        const res = await fetch(url, { method: "HEAD", redirect: "follow" });
        status = res.status;
        if (res.status >= 200 && res.status < 300) type = "valid";
        else if (res.status >= 300 && res.status < 400) type = "redirect";
        else if (res.status >= 400) type = "broken";
      } catch {
        type = "timeout";
      }
      results.push({ url, type, status });
      checked++;
      chrome.runtime.sendMessage({ action: "progress", checked, total: urls.length });
    }

    chrome.tabs.sendMessage(tabId, { action: "highlightLinks", results });
    chrome.runtime.sendMessage({ action: "scanResults", results });
  }
});
