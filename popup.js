document.getElementById("scanBtn").addEventListener("click", async () => {
  document.getElementById("progress").classList.remove("hidden");
  document.getElementById("results").classList.add("hidden");
  document.getElementById("listContainer").innerHTML = "";

  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: scanLinksOnPage
  }, async (injectionResults) => {
    const data = injectionResults[0].result;
    displayResults(data);
  });
});

function displayResults(data) {
  const { valid, broken, redirect } = data;

  document.getElementById("progress").classList.add("hidden");
  document.getElementById("results").classList.remove("hidden");

  document.getElementById("totalCount").textContent = valid.length + broken.length + redirect.length;
  document.getElementById("validCount").textContent = valid.length;
  document.getElementById("redirectCount").textContent = redirect.length;
  document.getElementById("brokenCount").textContent = broken.length;

  const container = document.getElementById("listContainer");
  [...valid, ...redirect, ...broken].forEach((item) => {
    const div = document.createElement("div");
    div.className = `p-2 rounded-md ${
      item.status === 'valid'
        ? 'bg-green-900 text-green-300'
        : item.status === 'redirect'
        ? 'bg-yellow-900 text-yellow-300'
        : 'bg-red-900 text-red-300'
    }`;
    div.textContent = `${item.url} → ${item.code}`;
    container.appendChild(div);
  });

  document.getElementById("downloadPdf").onclick = () => downloadReport(data, "pdf");
  document.getElementById("downloadTxt").onclick = () => downloadReport(data, "txt");
}

async function downloadReport(data, type) {
  const text = [
    "Link Inspector Pro - Scan Report",
    `Date: ${new Date().toLocaleString()}`,
    "",
    "VALID LINKS:",
    ...data.valid.map(l => `${l.url} (${l.code})`),
    "",
    "REDIRECT LINKS:",
    ...data.redirect.map(l => `${l.url} (${l.code})`),
    "",
    "BROKEN LINKS:",
    ...data.broken.map(l => `${l.url} (${l.code})`),
  ].join("\n");

  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  chrome.downloads.download({
    url,
    filename: `link-inspector-report.${type === "pdf" ? "txt" : "txt"}`,
  });
}

function scanLinksOnPage() {
  const anchors = [...document.querySelectorAll("a[href]")];
  const results = { valid: [], broken: [], redirect: [] };

  const checkLink = (a) => fetch(a.href, { method: "HEAD" })
    .then((r) => {
      if (r.status >= 200 && r.status < 300)
        results.valid.push({ url: a.href, code: r.status, status: "valid" });
      else if (r.status >= 300 && r.status < 400)
        results.redirect.push({ url: a.href, code: r.status, status: "redirect" });
      else
        results.broken.push({ url: a.href, code: r.status, status: "broken" });
      a.style.outline = r.status >= 200 && r.status < 300
        ? "2px solid limegreen"
        : r.status >= 300 && r.status < 400
        ? "2px solid orange"
        : "2px solid red";
    })
    .catch(() => {
      results.broken.push({ url: a.href, code: "ERR", status: "broken" });
      a.style.outline = "2px solid red";
    });

  return Promise.all(anchors.map(checkLink)).then(() => results);
}
