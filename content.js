function collect_links() {
    const anchors = document.querySelectorAll('a[href]')

    const links = []
    for(let a of anchors) {
        const href = a.href.trim()
        if(href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
            links.push({url: href, type: 'skipped'})
        } else {
            links.push({url: href, type: 'normal'})
        }
    }
    return links
}

// Listen for the messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("inside content listener")
    if(message.action === 'collect_links') {
        sendResponse({links: collect_links()})
    }

    if(message.action === "check_links") {
        console.log(message)
        checkLinks(message.links).then(results => {
            console.log(results)
            sendResponse({results})
        })
        return true
    }
})






// Listen to the messages
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//     if(message.action === "check_links") {
//         console.log(message)
//         checkLinks(message.links).then(results => {
//             console.log(results)
//             sendResponse({results})
//         })
//         return true
//     }
// })

async function  checkLinks(links) {
    const results = []
    for(let link of links) {
        if(link.type === 'skipped'){
            results.push({url: link.url, status: 'skipped'})
            continue
        }

        try {
            const res = await fetch(link.url, {method: 'HEAD',  redirect: 'follow'})
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