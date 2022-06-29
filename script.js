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

        //set window title, append to entry
        var wt = document.createElement('div')
        wt.classList.add("win-title")
        wt.innerHTML = browserWindow.title
        we.appendChild(wt)

        //create tab list
        let tl = document.createElement('div')
        tl.classList.add("tab-list")

        //create tab entries
        for(var tab of browserWindow.tabs) {
            let i = tab.id
            let t = tab.title
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
// browser.tabs.onCreated.addListener(tabModified)
// browser.tabs.onRemoved.addListener(listAllTabs)
browser.tabs.onUpdated.addListener(tabModified)
// browser.tabs.onMoved.addListener(listAllTabs)
// browser.tabs.onAttached.addListener(listAllTabs)
// browser.tabs.onDetached.addListener(listAllTabs)

function tabModified(tabId,changeInfo,tab) {
    
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