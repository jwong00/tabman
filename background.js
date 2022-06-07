let createData = {
    url: "test.html",
}

let creating = browser.tabs.create(createData)


/*q: if a background script creates a tab with a web page, is there a way to get access to the DOM of the web page in the tab?*/

// append to DOM to render list