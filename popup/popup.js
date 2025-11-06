const scanBtn = document.getElementById('scan')
const totalLinksCount = document.getElementById('total')
const validLinksCount = document.getElementById('valid')
const brokenLinksCount = document.getElementById('broken')
const redirectedLinksCount = document.getElementById('redirected')
const skippedLinksCount = document.getElementById('skipped')
const resetBtn = document.getElementById('reset')
const downloadBtn = document.getElementById('download-report')
const closeBtn =  document.getElementById('close')

closeBtn.addEventListener('click', ()=> {
    window.close();
})


resetBtn.addEventListener('click', ()=> {
    window.location.reload();
})

console.log("hello")
scanBtn.addEventListener('click', async ()=> {
    console.log("Inside popUp JS")
    scanBtn.setAttribute("disabled", true)
    scanBtn.innerText = "Scanning..."
    scanBtn.style.backgroundColor = "lightgrey"
    scanBtn.style.color = "black"
    // Get current tab
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true})

    // Collect all the links
    const {links} = await chrome.tabs.sendMessage(tab.id, {action: "collect_links"})
    console.log("Collected Links:", links)

    // Display count in the UI
    totalLinksCount.innerText = links.length
    

    // Check all link status
    chrome.runtime.sendMessage({ action: "check_links", links }, response => {
        console.log("Link check result:", response);
        validLinksCount.innerText = response.results.valid.length
        brokenLinksCount.innerText = response.results.broken.length
        skippedLinksCount.innerText = response.results.skipped.length
        redirectedLinksCount.innerText = response.results.redirected.length
        scanBtn.setAttribute("disabled", false)
        scanBtn.innerText = "Scan"
        scanBtn.style.backgroundColor = "rgb(64, 82, 181)"
        scanBtn.style.color = "white"

        downloadBtn.addEventListener('click', async ()=> {
            const data = response.results
            console.log("final results:", data)

            const validLinks = data.valid.map(link => link.url);
            const brokenLinks = data.broken.map(link => link.url);
            const redirectedLinks = data.redirected.map(link => link.url);
            const skippedLinks = data.skipped.map(link => link.url);
            const text =
            "Valid Links:\n\n" +
            (validLinks.length ? validLinks.join("\n") : "None") +
            "\n\nRedirected Links:\n\n" +
            (redirectedLinks.length ? redirectedLinks.join("\n") : "None") +
            "\n\nBroken Links:\n\n" +
            (brokenLinks.length ? brokenLinks.join("\n") : "None") +
            "\n\nSkipped Links:\n\n" +
            (skippedLinks.length ? skippedLinks.join("\n") : "None");
            const blob = new Blob([text], { type: 'application/json' });
            const url = URL.createObjectURL(blob); 
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Links-List.txt';
            a.click();
            URL.revokeObjectURL(url);
    });
})

});