const scanBtn = document.getElementById('scan')
const totalLinksCount = document.getElementById('total')
const validLinksCount = document.getElementById('valid')
const brokenLinksCount = document.getElementById('broken')
const redirectedLinksCount = document.getElementById('redirected')
const skippedLinksCount = document.getElementById('skipped')



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
    });
})

});