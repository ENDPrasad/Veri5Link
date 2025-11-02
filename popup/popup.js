const scanBtn = document.getElementById('scan')



console.log("hello")
scanBtn.addEventListener('click', async ()=> {
    console.log("Inside popUp JS")
    // Get current tab
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true})


    const {links} = await chrome.tabs.sendMessage(tab.id, {action: "collect_links"})
    console.log("Collected Links:", links)

    const data = await chrome.tabs.sendMessage(tab.id, {action: 'check_links', links})
    console.log(data)
})