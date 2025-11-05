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

    if(message.action === "highlight_links") {
        console.log(message)
        highlight_links(message.linkMapper)
    }
})

function highlight_links(linkMapper) {
    const anchors = document.querySelectorAll('a[href]')

    for(let a of anchors) {
        const href = a.href.trim()
        const value = linkMapper[href]
        if(value === 'valid'){
            a.style.backgroundColor = 'rgba(34,200,94,0.15)'
            a.style.border = '1px solid rgba(34,200,94,0.59)'
        }else if(value === 'skipped') {
            a.style.backgroundColor = 'rgba(128,128,128,0.15)'
            a.style.border = '1px solid rgba(128,128,128,0.5)'
        }else if(value === 'redirected') {
            a.style.backgroundColor = 'rgba(255,215,0,0.15)'
            a.style.border = '1px solid rgba(255,215,0,0.6)'
        }else if(value === 'broken') {
            a.style.backgroundColor = 'rgba(237,59,59,0.16)'
            a.style.borderColor = '1px solid rgba(237,59,59,0.65)'
        }else {
            // Need to handle error links
        }
    }
}