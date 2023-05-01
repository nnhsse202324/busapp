/// <reference path="./socket-io-client.d.ts"/>

var indexSocket = window.io('/'); // This line and the line above is how you get ts types to work on clientside... cursed
// !!! do NOT import/export anything or ejs will get angry

var pins: number[] = [];
var notifStatus = {};
updatePins();
updateTables();

// end of initializing stuff

indexSocket.on("update", (data) => {
    const html = ejs.render(document.getElementById("getRender")!.getAttribute("render")!, {data: data});
    document.getElementById("content")!.innerHTML = html;
    updateTables();
    /*
    0: create global variable that tracks which notifcations were sent for each bus
    {
        "10":["LOADING"]
    }
    1: get the table
    2: get table body
    3: get list of rows with .children
    4: loop through each row
        a:the first child of each row is the number column
        b:find the row where the .innerHTML of the number column == a pinned bus
        c: check the status of those rows by accessing the second child of each row
        d: if the status is "LOADING" or "NEXT WAVE", and that status is not in the global variable of sent notifications, send out a notification w/ status
        e: update the sent notifications variable
        f: once the bus status is set to "GONE", clear the list for the variable 
    */
    if (Notification.permission === 'granted') {
        let tablePins = <HTMLTableElement> document.getElementById("pin-bus-table");
        let pinRows = tablePins.rows;
        navigator.serviceWorker.getRegistration().then(function(reg2) {
            for (let i = 2; i < pinRows.length - 1; i++) {
                let number = parseInt(pinRows[i]!.firstElementChild!.innerHTML);
                let status = pinRows[i]!.firstElementChild!.nextElementSibling!.innerHTML
                if (pins.includes(number)) {
                    if (status == "Loading") {
                        reg2!.showNotification('Bus ' + number + ' is currently loading.');
                    } else if (status == "Next Wave") {
                        reg2!.showNotification('Bus ' + number + ' is in the next wave.');
                    } else if (status == "Gone") {
                        reg2!.showNotification('Bus ' + number + ' has left.');
                    }
                }
            }
        }
    )}
});

function updateTables() { // updates what rows show on the pinned list and what buttons show Unpin or Pin on the full list
    updatePins();
    let tablePins = <HTMLTableElement> document.getElementById("pin-bus-table");
    let pinRows = tablePins.rows;
    let lastHide = false; // determines if the last row ("no buses pinned") should be hidden or not
    for (let i = 2; i < pinRows.length - 1; i++) { // hides rows that aren't in the pins
        let number = parseInt(pinRows[i]!.firstElementChild!.innerHTML);
        if (pins.includes(number)) {
            pinRows[i].hidden = false;
            lastHide = true;
        } else {
            pinRows[i].hidden = true;
        }
    }
    pinRows[pinRows.length - 1].hidden = lastHide;

    let tableFull = <HTMLTableElement> document.getElementById("all-bus-table");
    let fullRows = tableFull.rows;
    for (let i = 2; i < fullRows.length; i++) { // first two rows are the table header and the column headers
        let number = parseInt(fullRows[i]!.firstElementChild!.innerHTML)
        let button = <HTMLElement> fullRows[i].lastElementChild!.firstElementChild
        if (pins.includes(number)){ // lol, lmao even
            button!.innerHTML = "<i class='fa-solid fa-thumbtack'></i> Unpin"
            button!.style.backgroundColor = "#ab0808";
        } else {
            button!.innerHTML = "<i class='fa-solid fa-thumbtack'></i> Pin"
            button!.style.backgroundColor = "#327fa8";
        }
    }
}

function updatePins() { // guess what
    const pinString = localStorage.getItem("pins"); 
    pins = [];
    if (pinString != null) {
        let pinArrayString:string[] = pinString.split(", ");
        for (let i = 0; i < pinArrayString.length; i++) {
            let n = parseInt(pinArrayString[i]);
            if (!pins.includes(n)) { pins.push(n); }
        }
    }
}

function pinBus(button: HTMLInputElement) {
    updatePins();
    const busRow = button.parentElement!.parentElement; // this is the overarching <tr> element of the bus row
    const busNumber = busRow!.firstElementChild!.innerHTML; // this is the stringification of the number of the bus
    
    const num = parseInt(busNumber); // this is the number of the bus
    if (pins.includes(num) == false) {
        pins.push(num);
        pins.sort();
        let newPinString = pins.join(", "); // representation of the pins list as a string
        localStorage.setItem("pins", newPinString);
    } else {
        pins = pins.filter(function notNum(n: number) {return n != num;}); // this is how you remove elements in js arrays. pain
        pins.sort();
        if (pins.length == 0) {
            localStorage.removeItem("pins");
        } else {
            let newPinString = pins.join(", "); // representation of the pins list as a string
            localStorage.setItem("pins", newPinString);
        }
    }
    updateTables();
}

function createNotifStatus() {
    for (let i = 0; i < pins.length; i++) {
        notifStatus[pins[i]] = 0;
    }
}

function updateNotifStatus() {
    
}

function getRow(n: number) { // returns the row from the all-bus-table corresponding with the number input, doesn't return anything otherwise
    let tableFull = <HTMLTableElement> document.getElementById("all-bus-table");
    let fullRows = tableFull.rows;
    for (let i = 2; i < fullRows.length; i++) {
        let number = parseInt(fullRows[i]!.firstElementChild!.innerHTML)
        if (n === number) {
            return fullRows[i];
        }
    }
}

function resetPins() {
    if (confirm("Are you sure you want to clear your pins?")) {
        localStorage.removeItem("pins");
    }
}

if('serviceWorker' in navigator){
    //navigator represents browser and info about it. Checking if service worker works on browser that's running website.
    //checks if serviceWorkers work within the search engine
    navigator.serviceWorker.register('/sw.js')
    //Gets file and registers "sw.js", and returns a promise.
        .then(() => console.log('service worker registered!'))
        // calls function when promise is resolved
        .catch(() => console.log('service worker not registered; error :( '))
        //calls function when promise is rejected
    //No matter what, this will lead to some value. This is called a promise, as unlike a function, it'll always result in some output.
}