const scanBtn = document.getElementById("scan");
const totalLinksCount = document.getElementById("total");
const validLinksCount = document.getElementById("valid");
const brokenLinksCount = document.getElementById("broken");
const redirectedLinksCount = document.getElementById("redirected");
const skippedLinksCount = document.getElementById("skipped");

console.log("hello");
scanBtn.addEventListener("click", async () => {
  console.log("Inside popUp JS");
  // Get current tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Collect all the links
  const { links } = await chrome.tabs.sendMessage(tab.id, {
    action: "collect_links",
  });
  console.log("Collected Links:", links);

  // Display count in the UI
  totalLinksCount.innerText = links.length;

  // Check all link status
  const { results } = await sendMessageAsync({ action: "check_links", links });
  validLinksCount.innerText = results.results.valid.length;
  brokenLinksCount.innerText = results.results.broken.length;
  skippedLinksCount.innerText = results.results.skipped.length;
  redirectedLinksCount.innerText = results.results.redirected.length;

  await chrome.tabs.sendMessage(tab.id, {
    action: "highlight_links",
    linkMapper: results.linkMapper,
  });
});


// To return the actual data, the Promise will be handled here
function sendMessageAsync(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
}
