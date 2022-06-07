// create list of windows
var windows = browser.windows.getAll({
    populate: true,
    windowTypes: ["normal"]
});


console.log(windows)

//get from dom..
var wl = document.querySelector("#win-list")
console.log(wl)

windows.then(listAllTabs,onError)

function listAllTabs(windows) {
    for(window in windows) {
         console.log(`iterating windows...${window}`)
         console.log(`window: ${window.id}`)

        //first tab should be window title, or maybe active tab?
        // let tl = document.createElement('div')
        // tl.classlist.add("tab-list")
        //append to some struct in dom, list maybe?
        //start retrieving tabs
        //iterate over tabs:
        // for(tab in window.tabs) {
        //     let t = tab.title
        //     let u = tab.url

        //     let str = `${t} <${u}>`

        //     let entry = document.createElement('div')
        //     entry.classlist.add('tab-entry')
        //     entry.innerHTML = str

        //     tl.appendChild(entry)
        // }

        // wl.appendChild(tl)       
    }
}

function onError() {
    console.log("error!")
}

// document.appendChild(wl);