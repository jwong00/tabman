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

        //creat tab entries
        for(tab of browserWindow.tabs) {
            let t = convertToPlainText(tab.title)
            let u = tab.url
            let i = tab.id
            
            let str = 
            `<input type="checkbox" id="${i}" value="${u}"> <label for=${i}>${t}</label> <<a href="${u}">${u}</a>>`;

            // console.log(`   ${str}`)

            let entry = document.createElement('div')
            entry.classList.add("tab-entry")
            entry.innerHTML = str

            tl.appendChild(entry)
        }

        we.appendChild(tl)

        wl.appendChild(we)       
    }
}

function onError() {
    console.log("error!")
}

function convertToPlainText(str) {
    str.replace('&','\u0026')
    str.replace('<','\u003c')
    str.replace('>','\u003e')
    str.replace('"','\u0022')

    console.log(str)

    return str
}

// document.appendChild(wl);