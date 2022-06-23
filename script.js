
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

//data struct (current array) for storing tab info
var list = Array()

const options = {
    includeScore: true
}
const fuse = new Fuse(list,options)

//should execute on extension start and whenever tabs change, so quite frequently..
function listAllTabs(browserWindows) {
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
            
            list.push(t)
            //init tab entry
            let entry = document.createElement('div')
            entry.classList.add("tab-entry")

            //checkbox
            let c = document.createElement('input')
            c.setAttribute("type","checkbox")
            c.setAttribute("id",i)
            c.setAttribute("value",u)
            entry.append(c)

            entry.append(' ')

            //label (tab title)
            let l = document.createElement('label')
            l.setAttribute("for",i)
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

    }

    console.log(list)
}

function onError() {
    console.log("error!")
}

//SEARCH

const f = document.getElementById('filter')

f.addEventListener('input',searchHandler)

function searchHandler(e) {
    if(e.type=='input') {
        console.log("input detected!")
        console.log(e.target.value)
        const result = fuse.search(e.target.value)
        console.log(result)
    }
    else console.log("wtf!?")

}