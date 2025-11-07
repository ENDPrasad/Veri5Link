const scanBtn = document.getElementById("scan");
const totalLinksCount = document.getElementById("total");
const validLinksCount = document.getElementById("valid");
const brokenLinksCount = document.getElementById("broken");
const redirectedLinksCount = document.getElementById("redirected");
const skippedLinksCount = document.getElementById("skipped");
const resetBtn = document.getElementById("reset");
const downloadBtn = document.getElementById("download-report");
const closeBtn = document.getElementById("close");

closeBtn.addEventListener("click", () => {
  window.close();
});

resetBtn.addEventListener("click", () => {
  window.location.reload();
});

console.log("hello");
scanBtn.addEventListener("click", async () => {
  console.log("Inside popUp JS");
  scanBtn.setAttribute("disabled", true);
  scanBtn.innerText = "Scanning...";
  scanBtn.style.backgroundColor = "lightgrey";
  scanBtn.style.color = "black";
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
  scanBtn.setAttribute("disabled", false);
  scanBtn.innerText = "Scan";
  scanBtn.style.backgroundColor = "rgb(64, 82, 181)";
  scanBtn.style.color = "white";

  downloadBtn.addEventListener("click", async () => {
    downloadReport(results.results);
  });

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

function downloadReport(data) {
  const categories = ["valid", "redirected", "broken", "skipped"];

  // Build text dynamically based on available categories
  const text = categories
    .map((key) => {
      const links = data[key]?.map((link) => link.url) || [];
      const sectionTitle =
        key.charAt(0).toUpperCase() + key.slice(1) + " Links:";
      const sectionContent = links.length ? links.join("\n") : "None";
      return `${sectionTitle}\n\n${sectionContent}`;
    })
    .join("\n\n");

  // Create a downloadable text file
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Links-List.txt";
  a.click();
  URL.revokeObjectURL(url);
}
