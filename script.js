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
            let i = tab.id
            let t = tab.title
            let u = tab.url
            
            let entry = document.createElement('div')
            entry.classList.add("tab-entry")

            let c = document.createElement('input')
            c.setAttribute("type","checkbox")
            c.setAttribute("id",i)
            c.setAttribute("value",u)
            entry.append(c)
            entry.append(' ')

            let l = document.createElement('label')
            l.setAttribute("for",i)
            l.textContent = t
            entry.append(l)
            entry.append(' ')

            let a = document.createElement('a')
            a.setAttribute("href",u)
            a.textContent = `<${u}>`
            entry.append(a)

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