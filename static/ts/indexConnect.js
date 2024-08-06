"use strict";
/// <reference path="./socket-io-client.d.ts"/>
var indexSocket = window.io('/'); // This line and the line above is how you get ts types to work on clientside... cursed
// !!! do NOT import/export anything or ejs will get angry
var pins = [];
var notifStatus = {};
updatePins();
updateTables();
// end of initializing stuff
indexSocket.on("update", (data) => {
    //console.log("update received")
    // convert from time strings to dates to allow conversion to local time
    data.buses.forEach((bus) => {
        if (bus.time != "")
            bus.time = new Date(bus.time);
    });
    const html = ejs.render(document.getElementById("getRender").getAttribute("render"), { data: data, announcement: data.announcement });
    document.getElementById("content").innerHTML = html;
    updateTables();
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
//# sourceMappingURL=indexConnect.js.map