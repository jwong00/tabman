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
    let window = await browser.windows.get(activeInfo.windowId)
    windowTitleElement.textContent = window.title
}

async function onMovedHandler(tabId, moveInfo) {
    let tab = await browser.tabs.get(tabId)
    let tabEntryElement = document.getElementById(tabId)

    let tabAfter = await getTabAfter(tab)

    //The window whose windowId == moveInfo.windowId
    //SHOULD ALREADY EXIST(?)
    //
    let tabListElement = document.getElementById(`t${moveInfo.windowId}`)
    
    if(tabAfter==null) tabListElement.appendChild(tabEntryElement)
    else {
        let tabEntryElementAfter = document.getElementById(tabAfter.id)
        tabListElement.insertBefore(tabEntryElement,tabEntryElementAfter)
    }

}

async function onAttachedHandler(tabId, attachInfo) {
    // let tl = document.getElementById(`t${attachInfo.newWindowId}`)
    
    console.log("ATTACH DEBUG")
    try { 
        await browser.tabs.get(tabId).then(onCreatedHandler)
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
    let windowEntryElement = document.getElementById(`w${tab.windowId}`)
    if(windowEntryElement===null) {
        //make window entry
        windowEntryElement = createWindowEntry(tab)
        let windowListElement = document.querySelector("#win-list")
        windowListElement.appendChild(windowEntryElement)
    }

    let tabListElement = document.getElementById(`t${tab.windowId}`)

    let tabAfter = await getTabAfter(tab)
    let tabCurrent = createTabEntry(tab)

    if(tabAfter==null) tabListElement.appendChild(createTabEntry(tab))
    //this next line should always be valid
    //assuming my understanding that a tab's id shouldn't 
    //change after it's been made
    else tabListElement.insertBefore(tabCurrent,document.getElementById(tabAfter.id))
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
    let windowEntryElement = document.createElement('div')
    windowEntryElement.classList.add("win-entry")
    windowEntryElement.setAttribute("id",`w${tab.windowId}`)

    let windowTitleElement = document.createElement('div')
    windowTitleElement.classList.add("win-title")
    windowTitleElement.innerHTML = tab.title
    windowTitleElement.setAttribute("id" `window-title-${browserWindow.id}`)
    windowEntryElement.appendChild(windowTitleElement)

    let tabListElement = document.createElement('div')
    tabListElement.classList.add("tab-list")
    tabListElement.setAttribute("id",`t${tab.windowId}`)
    windowEntryElement.appendChild(tabListElement)

    return windowEntryElement
}

function createTabEntry(tab) {
    let id = tab.id
    let title = tab.title
    // let t = `${tab.index} ${tab.title}`
    let url = tab.url
    
    let searchIndexEntry = {
        id: id,
        title: title,
        url: url
    }
    searchIndex.push(searchIndexEntry)

    //init tab entry
    let tabEntryElement = document.createElement('div')
    tabEntryElement.classList.add("tab-entry")
    tabEntryElement.setAttribute("id",id)

    //checkbox
    let checkboxElement = document.createElement('input')
    checkboxElement.setAttribute("type","checkbox")
    checkboxElement.setAttribute("id",`c${id}`)
    checkboxElement.setAttribute("value",url)
    tabEntryElement.append(checkboxElement)

    tabEntryElement.append(' ')

    //label (tab title)
    let labelElement = document.createElement('label')
    labelElement.setAttribute("for",`c${id}`)
    labelElement.textContent = title
    tabEntryElement.append(labelElement)

    tabEntryElement.append(' ')

    //url
    let urlElement = document.createElement('a')
    urlElement.setAttribute("href",url)
    urlElement.textContent = `<${url}>`
    tabEntryElement.append(urlElement)

    return tabEntryElement
}

function onUpdatedHandler(tabId,changeInfo,tab) {
    
    //get tab entry to change
    let tabEntryElement = document.getElementById(tabId)
    tabEntryElement.replaceChildren()

    //checkbox
    let checkboxElement = document.createElement('input')
    checkboxElement.setAttribute("type","checkbox")
    checkboxElement.setAttribute("id",`c${tab.id}`)
    checkboxElement.setAttribute("value",tab.url)
    tabEntryElement.append(checkboxElement)

    tabEntryElement.append(' ')

    //label
    let labelElement = document.createElement('label')
    labelElement.setAttribute("for",`c${tab.id}`)
    labelElement.textContent = tab.title
    tabEntryElement.append(labelElement)

    tabEntryElement.append(' ')

    //url
    let urlElement = document.createElement('a')
    urlElement.setAttribute("href",tab.url)
    urlElement.textContent = `<${tab.url}>`
    tabEntryElement.append(urlElement)
}

//SEARCH

const filter = document.getElementById('filter')

filter.addEventListener('input',searchHandler)

function searchHandler(event) {
    
    if(event.type=='input') {
        if(event.target.value.length > 0) {
            hideAllTabEntries()
            const results = fuse.search(event.target.value)
            if(DEBUG) console.log(results)
            showResults(results)
        }
        else if(event.target.value.length === 0) {
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