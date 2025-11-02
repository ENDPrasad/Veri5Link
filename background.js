
console.log("🔥 Background service worker started!");

// Listen to the messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log(message)
    if(message.action === "check_links") {
        console.log(message)
        checkLinks(message.links).then(results => {
            console.log(results)
            sendResponse({results})
        })
        return true
    }
})

async function  checkLinks(links) {
    const results = []
    for(let link of links) {
        if(link.type === 'skipped'){
            results.push({url: link.url, status: 'skipped'})
            continue
        }

        try {
            const res = await fetch(link.url, {method: 'GET',  redirect: 'follow'})
            if(res.ok) {
                results.push( {url: link.url, status: res.redirected ? 'redirected': 'valid'})
            }else {
                results.push({url: link.url, status: 'broken', code: res.status})
            }
        } catch (error) {
            results.push({url: link.url, status: 'warning', message: error.message})
        }
    }
    return results
    
}