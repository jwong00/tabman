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
        wt.innerHTML = browserWindow.title
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

//RELOAD ALL TABS WHEN CERTAIN EVENTS FIRE:
browser.tabs.onCreated.addListener(onCreatedHandler)
browser.tabs.onRemoved.addListener(onRemovedHandler)
browser.tabs.onUpdated.addListener(onUpdatedHandler)
// browser.tabs.onMoved.addListener(listAllTabs)
browser.tabs.onAttached.addListener(onAttachedHandler)
browser.tabs.onDetached.addListener(onDetachedHandler)

function onAttachedHandler(tabId, attachInfo) {

    console.log(tabId)
    let tl = document.getElementById(`t${attachInfo.neWindowId}`)
    
    // tl.appendChild(createTabEntry(tabs.get(tabId)))
    tabs.get(tabId).then(createTabEntry(tab))
}

function onDetachedHandler(tabId, detachInfo) {
    document.getElementById(tabId).remove()
}

function onCreatedHandler(tab) {
    //check if window-entry and its child tab-list exist:
    let we = document.getElementById(`w${tab.windowId}`)
    if(we===null) {
        //make window entry
        we = createWindowEntry(tab)
        let wl = document.querySelector("#win-list")
        wl.appendChild(we)
    }

    let tl = document.getElementById(`t${tab.windowId}`)
    tl.appendChild(createTabEntry(tab))
    // let wl = document.getElementById("win-list")
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
    // console.log(fuse.getIndex())
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
    console.log("START")
    console.log(results)
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