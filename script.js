//GLOBALS 
const DEBUG = true
const WARN_ERROR = true

// create list of windows
var windowsPromise = browser.windows.getAll({
    populate: true,
    windowTypes: ["normal"]
});

windowsPromise.then(listAllTabs,onError)

//data struct (current array) for storing tab info
var searchIndex = Array()

const options = {
    threshold: 0.4,
    includeScore: true,
    includeMatches: true,
    shouldSort: true,
    fieldNormWeight: 0.5,
    keys: ['title']
}
var fuse = new Fuse(searchIndex,options)
// = new Fuse(list,options)

//should execute on extension start 
//and whenever tabs change(??????????)
function listAllTabs(browserWindows) {

    var wl = document.querySelector("#win-list")

    if(DEBUG) console.log(wl)
    for(var browserWindow of browserWindows) {
        console.log(`${browserWindow.id} ${browserWindow.title}`)

        //create window entry
        var we = document.createElement('div')
        we.classList.add("win-entry")
        we.setAttribute("id",`w${browserWindow.id}`)

        //set window title, append to entry
        var wt = document.createElement('div')
        wt.classList.add("win-title")
        wt.setAttribute("id", `window-title-${browserWindow.id}`)
        // wt.innerHTML = browserWindow.title
        wt.textContent = browserWindow.title
        we.appendChild(wt)

        //create tab list
        let tl = document.createElement('div')
        tl.classList.add("tab-list")
        tl.setAttribute("id",`t${browserWindow.id}`)

        //create tab entries
        for(var tab of browserWindow.tabs) {
            let i = tab.id
            let t = `${tab.index} ${tab.title}`
            let u = tab.url
            
            let searchIndexEntry = {
                id: i,
                title: t,
                url: u
            }
            searchIndex.push(searchIndexEntry)

            //init tab entry
            let entry = document.createElement('div')
            entry.classList.add("tab-entry")
            entry.setAttribute("id",i)

            //checkbox
            let c = document.createElement('input')
            c.setAttribute("type","checkbox")
            c.setAttribute("id",`c${i}`)
            c.setAttribute("value",u)
            entry.append(c)

            entry.append(' ')

            //label (tab title)
            let l = document.createElement('label')
            l.setAttribute("for",`c${i}`)
            l.textContent = t
            entry.append(l)

            entry.append(' ')

            //url
            let a = document.createElement('a')
            a.setAttribute("href",u)
            a.textContent = `<${u}>`
            entry.append(a)

            tl.appendChild(entry)
        }

        we.appendChild(tl)

        wl.appendChild(we) 
        fuse = new Fuse(searchIndex,options)

    }

    if(DEBUG) console.log(searchIndex)
}

browser.tabs.onCreated.addListener(onCreatedHandler)
browser.tabs.onRemoved.addListener(onRemovedHandler)
browser.tabs.onUpdated.addListener(onUpdatedHandler)
browser.tabs.onMoved.addListener(onMovedHandler)
browser.tabs.onAttached.addListener(onAttachedHandler)
browser.tabs.onDetached.addListener(onDetachedHandler)
browser.tabs.onActivated.addListener(onActivatedListener)

async function onActivatedListener(activeInfo) {
    let windowTitleElement = document.getElementById(`window-title-${activeInfo.windowId}`)
    let w = await browser.windows.get(activeInfo.windowId)
    windowTitleElement.textContent = w.title
}

async function onMovedHandler(tabId, moveInfo) {
    let tab = await browser.tabs.get(tabId)
    let tabEntryElement = document.getElementById(tabId)

    let tabAfter = await getTabAfter(tab)

    //The window whose windowId == moveInfo.windowId
    //SHOULD ALREADY EXIST(?)
    //
    let tabList = document.getElementById(`t${moveInfo.windowId}`)
    
    if(tabAfter==null) tabList.appendChild(tabEntryElement)
    else {
        let tabEntryElementAfter = document.getElementById(tabAfter.id)
        tabList.insertBefore(tabEntryElement,tabEntryElementAfter)
    }

}

async function onAttachedHandler(tabId, attachInfo) {
    let tl = document.getElementById(`t${attachInfo.newWindowId}`)
    
    try { 
        let t = await browser.tabs.get(tabId).then(onCreatedHandler)
    }
    catch(error) {
        console.log(error)
    }
}

function onDetachedHandler(tabId, detachInfo) {
    document.getElementById(tabId).remove()
}

async function onCreatedHandler(tab) {
    //check if window-entry and its child tab-list exist:
    let we = document.getElementById(`w${tab.windowId}`)
    if(we===null) {
        //make window entry
        we = createWindowEntry(tab)
        let wl = document.querySelector("#win-list")
        wl.appendChild(we)
    }

    let tl = document.getElementById(`t${tab.windowId}`)

    let ta = await getTabAfter(tab)
    let t = createTabEntry(tab)

    if(ta==null) tl.appendChild(createTabEntry(tab))
    //this next line should always be valid
    //assuming my understanding that a tab's id shouldn't 
    //change after it's been made
    else tl.insertBefore(t,document.getElementById(ta.id))


    // let wl = document.getElementById("win-list")
}

async function getTabAfter(tab) {
    try {
        let w = await browser.windows.get(tab.windowId, {populate: true})

        //get TAB ENTRY ELEMENT HERE then return it
        return w.tabs[tab.index+1]
    }
    catch(error) {
        console.log(error)
    }
}

function onRemovedHandler(tabId,removeInfo) {
    const tabEntry = document.getElementById(tabId)
    tabEntry.remove()
    if(removeInfo.isWindowClosing) {
        const windowEntry = document.getElementById(`w${removeInfo.windowId}`)
        windowEntry.remove()
    }
}

function createWindowEntry(tab) {
    let we = document.createElement('div')
    we.classList.add("win-entry")
    we.setAttribute("id",`w${tab.windowId}`)

    let wt = document.createElement('div')
    wt.classList.add("win-title")
    wt.innerHTML = tab.title
    wt.setAttribute("id" `window-title-${browserWindow.id}`)
    we.appendChild(wt)

    let tl = document.createElement('div')
    tl.classList.add("tab-list")
    tl.setAttribute("id",`t${tab.windowId}`)
    we.appendChild(tl)

    return we
}

function createTabEntry(tab) {
    let i = tab.id
    let t = tab.title
    // let t = `${tab.index} ${tab.title}`
    let u = tab.url
    
    let searchIndexEntry = {
        id: i,
        title: t,
        url: u
    }
    searchIndex.push(searchIndexEntry)

    //init tab entry
    let entry = document.createElement('div')
    entry.classList.add("tab-entry")
    entry.setAttribute("id",i)

    //checkbox
    let c = document.createElement('input')
    c.setAttribute("type","checkbox")
    c.setAttribute("id",`c${i}`)
    c.setAttribute("value",u)
    entry.append(c)

    entry.append(' ')

    //label (tab title)
    let l = document.createElement('label')
    l.setAttribute("for",`c${i}`)
    l.textContent = t
    entry.append(l)

    entry.append(' ')

    //url
    let a = document.createElement('a')
    a.setAttribute("href",u)
    a.textContent = `<${u}>`
    entry.append(a)

    return entry
}

function onUpdatedHandler(tabId,changeInfo,tab) {
    
    //get tab entry to change
    let te = document.getElementById(tabId)
    te.replaceChildren()

    //checkbox
    let c = document.createElement('input')
    c.setAttribute("type","checkbox")
    c.setAttribute("id",`c${tab.id}`)
    c.setAttribute("value",tab.url)
    te.append(c)

    te.append(' ')

    //label
    let l = document.createElement('label')
    l.setAttribute("for",`c${tab.id}`)
    l.textContent = tab.title
    te.append(l)

    te.append(' ')

    //url
    let a = document.createElement('a')
    a.setAttribute("href",tab.url)
    a.textContent = `<${tab.url}>`
    te.append(a)
}

//SEARCH

const f = document.getElementById('filter')

f.addEventListener('input',searchHandler)

function searchHandler(e) {
    
    if(e.type=='input') {
        if(e.target.value.length > 0) {
            hideAllTabEntries()
            const results = fuse.search(e.target.value)
            if(DEBUG) console.log(results)
            showResults(results)
        }
        else if(e.target.value.length === 0) {
            showAllTabEntries()
        }
        else {
            if(WARN_ERROR)console.log("wtf")
        }
    }
    else if(WARN_ERROR) console.log("wtf")
}

//HELPER

function hideAllTabEntries() {
    let tabEntries = document.getElementsByClassName("tab-entry")
    for(var tabEntry of tabEntries) {
        tabEntry.hidden = true
    }
}

function showAllTabEntries() {
    let tabEntries = document.getElementsByClassName("tab-entry")
    for(var tabEntry of tabEntries) {
        tabEntry.hidden = false
    }
}

function showResults(results) {
    for(var result of results) {
        console.log(result)
        // console.log(result.item.id)
        showTab(result.item.id)
    }
}

function showTab(id) {
    document.getElementById(id).hidden = false
}

function onError() {
    if(WARN_ERROR) console.log("error!")
}