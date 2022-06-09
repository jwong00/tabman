// create list of windows
var windowsPromise = browser.windows.getAll({
    populate: true,
    windowTypes: ["normal"]
});


console.log(windowsPromise)

//get from dom..
var wl = document.querySelector("#win-list")
console.log(wl)

// let tl = document.createElement('div')
// tl.classList.add("tab-list")

// console.log(tl.classList[0])

windowsPromise.then(listAllTabs,onError)

function listAllTabs(browserWindows) {
    for(browserWindow of browserWindows) {
         console.log(`${browserWindow.id} ${browserWindow.title}`)

        //first tab should be window title, or maybe active tab?
        let tl = document.createElement('div')
        tl.classList.add("tab-list")
        //append to some struct in dom, list maybe?
        //start retrieving tabs
        //iterate over tabs:
        for(tab of browserWindow.tabs) {
            let t = tab.title
            let u = tab.url
            let i = tab.id
            
            let str = `${i} ${t} ${u}`

            // console.log(`   ${str}`)

            let entry = document.createElement('div')
            entry.classList.add("tab-entry")
            entry.innerHTML = str

            tl.appendChild(entry)
        }

        wl.appendChild(tl)       
    }
}

function onError() {
    console.log("error!")
}

// document.appendChild(wl);