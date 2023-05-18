"use strict";
/// <reference path="./socket-io-client.d.ts"/>
var indexSocket = window.io('/'); // This line and the line above is how you get ts types to work on clientside... cursed
// !!! do NOT import/export anything or ejs will get angry
var pins = [];
var notifStatus = {};
updatePins();
updateTables();
updateNotifStatus();
console.log(notifStatus);
// end of initializing stuff
indexSocket.on("update", (data) => {
    const html = ejs.render(document.getElementById("getRender").getAttribute("render"), { data: data });
    document.getElementById("content").innerHTML = html;
    updateTables();
    if (Notification.permission === 'granted') {
        let oldNotifStatus = Object.assign({}, notifStatus); // copies over notifStatus without bringing the object reference with it
        updateNotifStatus();
        navigator.serviceWorker.getRegistration().then(function (reg2) {
            for (let i = 0; i < pins.length; i++) {
                if (oldNotifStatus[pins[i]] != notifStatus[pins[i]]) {
                    let row = getRow(pins[i]);
                    if (row) {
                        let cell = row.children[0].innerHTML;
                        if (cell.length > 3) {
                            let change = parseInt(cell.substring(cell.length - 3)); // VERY jank way to get the bus change but it should work in 100% of cases
                            switch (notifStatus[pins[i]]) {
                                case 1: // next wave
                                    reg2.showNotification("Bus " + pins[i] + " (changed to " + change + ") is in the next wave!");
                                    break;
                                case 2: // loading
                                    reg2.showNotification("Bus " + pins[i] + " (changed to " + change + ") is loading!");
                                    break;
                                case 3: // gone
                                    reg2.showNotification("Bus " + pins[i] + " (changed to " + change + ") has left!");
                                    break;
                            }
                        }
                        else {
                            switch (notifStatus[pins[i]]) {
                                case 1: // next wave
                                    reg2.showNotification("Bus " + pins[i] + " is in the next wave!");
                                    break;
                                case 2: // loading
                                    reg2.showNotification("Bus " + pins[i] + " is loading!");
                                    break;
                                case 3: // gone
                                    reg2.showNotification("Bus " + pins[i] + " has left!");
                                    break;
                            }
                        }
                    }
                }
            }
        });
    }
});
function updateTables() {
    updatePins();
    let tablePins = document.getElementById("pin-bus-table");
    let pinRows = tablePins.rows;
    let lastHide = false; // determines if the last row ("no buses pinned") should be hidden or not
    for (let i = 2; i < pinRows.length - 1; i++) { // hides rows that aren't in the pins
        let number = parseInt(pinRows[i].firstElementChild.innerHTML);
        if (pins.includes(number)) {
            pinRows[i].hidden = false;
            lastHide = true;
        }
        else {
            pinRows[i].hidden = true;
        }
    }
    pinRows[pinRows.length - 1].hidden = lastHide;
    let tableFull = document.getElementById("all-bus-table");
    let fullRows = tableFull.rows;
    for (let i = 2; i < fullRows.length; i++) { // first two rows are the table header and the column headers
        let number = parseInt(fullRows[i].firstElementChild.innerHTML);
        let button = fullRows[i].lastElementChild.firstElementChild;
        if (pins.includes(number)) { // lol, lmao even
            button.innerHTML = "<i class='fa-solid fa-thumbtack'></i> Unpin";
            button.style.backgroundColor = "#ab0808";
        }
        else {
            button.innerHTML = "<i class='fa-solid fa-thumbtack'></i> Pin";
            button.style.backgroundColor = "#327fa8";
        }
    }
}
function updatePins() {
    const pinString = localStorage.getItem("pins"); // retrieves "pins" item
    pins = [];
    if (pinString != null) {
        let pinArrayString = pinString.split(", ");
        for (let i = 0; i < pinArrayString.length; i++) {
            let n = parseInt(pinArrayString[i]);
            if (!pins.includes(n)) {
                pins.push(n);
            }
        }
    }
}
function pinBus(button) {
    updatePins();
    const busRow = button.parentElement.parentElement; // this is the overarching <tr> element of the bus row
    const busNumber = busRow.firstElementChild.innerHTML; // this is the stringification of the number of the bus
    const num = parseInt(busNumber); // this is the number of the bus
    if (pins.includes(num) == false) {
        pins.push(num);
        pins.sort();
        let newPinString = pins.join(", "); // representation of the pins list as a string
        localStorage.setItem("pins", newPinString);
    }
    else {
        pins = pins.filter(function notNum(n) { return n != num; }); // this is how you remove elements in js arrays. pain
        pins.sort();
        if (pins.length == 0) {
            localStorage.removeItem("pins");
        }
        else {
            let newPinString = pins.join(", "); // representation of the pins list as a string
            localStorage.setItem("pins", newPinString);
        }
    }
    updateTables();
}
function updateNotifStatus() {
    let tableFull = document.getElementById("all-bus-table");
    let fullRows = tableFull.rows;
    for (let i = 2; i < fullRows.length; i++) { // first two rows are the table header and the column headers
        let number = parseInt(fullRows[i].firstElementChild.innerHTML);
        let status = fullRows[i].firstElementChild.nextElementSibling.innerHTML;
        switch (status) {
            case "Next Wave":
                notifStatus[number] = 1;
                break;
            case "Loading":
                notifStatus[number] = 2;
                break;
            case "Gone":
                notifStatus[number] = 3;
                break;
            default:
                notifStatus[number] = 0;
        }
    }
}
function getRow(n) {
    let tableFull = document.getElementById("all-bus-table");
    let fullRows = tableFull.rows;
    for (let i = 2; i < fullRows.length; i++) {
        let number = parseInt(fullRows[i].firstElementChild.innerHTML);
        if (n === number) {
            return fullRows[i];
        }
    }
}
function requestNotificationPermission() {
    if (Notification.permission === 'default') {
        Notification.requestPermission(function (status) {
            console.log(status);
        });
    }
}
if ('serviceWorker' in navigator) {
    //navigator represents browser and info about it. Checking if service worker works on browser that's running website.
    //checks if serviceWorkers work within the search engine
    navigator.serviceWorker.register('/sw.js')
        //Gets file and registers "sw.js", and returns a promise.
        .then(() => console.log('service worker registered!'))
        // calls function when promise is resolved
        .catch(() => console.log('service worker not registered; error :( '));
    //calls function when promise is rejected
    //No matter what, this will lead to some value. This is called a promise, as unlike a function, it'll always result in some output.
}
//# sourceMappingURL=indexConnect.js.map