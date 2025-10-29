if (window._linkInspectorInjected) return;
window._linkInspectorInjected = true;

const style = document.createElement("style");
style.innerHTML = `
  a[data-li-status] { position: relative; border-bottom: 3px solid transparent; }
  a[data-li-status="valid"] { border-color: #10b981; }
  a[data-li-status="redirect"] { border-color: #f59e0b; }
  a[data-li-status="broken"] { border-color: #ef4444; }
  a[data-li-status="timeout"] { border-color: #94a3b8; }
`;
document.head.appendChild(style);

chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg.action === "clearHighlights") {
    document.querySelectorAll("a[data-li-status]").forEach(a => {
      a.removeAttribute("data-li-status");
    });
  }
  if (msg.action === "collectLinks") {
    const urls = Array.from(document.querySelectorAll("a[href]")).map(a => a.href);
    chrome.runtime.sendMessage({ action: "linksFound", urls, tabId: msg.tabId });
  }
  if (msg.action === "highlightLinks") {
    msg.results.forEach(r => {
      const link = [...document.querySelectorAll("a[href]")].find(a => a.href === r.url);
      if (link) link.setAttribute("data-li-status", r.type);
    });
  }
});
