
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
    const results = {skipped: [], valid: [], broken: [], redirected: [], warning: []}
    const linkMapper = {}
    for(let link of links) {
        if(link.type === 'skipped'){
            results.skipped.push({url: link.url, status: 'skipped'})
            linkMapper[link.url] = 'skipped'
            continue
        }

        try {
            const res = await fetch(link.url, {method: 'HEAD',  redirect: 'follow'})
            if(res.ok) {
                const key = res.redirected ? 'redirected': 'valid'
                results[key].push( {url: link.url, status: key})
                linkMapper[link.url] = key
            }else {
                results.broken.push({url: link.url, status: 'broken', code: res.status})
                linkMapper[link.url] = 'broken'

            }
        } catch (error) {
            results.warning.push({url: link.url, status: 'warning', message: error.message})
            linkMapper[link.url] = 'warning'

        }
    }
    return {results, linkMapper}
    
}