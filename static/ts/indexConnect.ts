/// <reference path="./socket-io-client.d.ts"/>

var indexSocket = window.io('/'); // This line and the line above is how you get ts types to work on clientside... cursed
// !!! do NOT import/export anything or ejs will get angry

var pins: number[] = [];
var weatherData = fetch('/weather');
updatePins();

indexSocket.on("update", (data: any) => {
    updatePins();
    
    const htmlPins = ejs.render(document.getElementById("renderPins")!.getAttribute("render")!, {data: data, pin: pins});
    const htmlAll = ejs.render(document.getElementById("renderAll")!.getAttribute("render")!, {data: data});

    document.getElementById("pinBus")!.innerHTML = htmlPins;
    document.getElementById("allBus")!.innerHTML = htmlAll;
});

function updateData() { // you will never guess what this does
    weatherData = fetch('/weather');
}

function updatePins() { // call (very) (extremely) often cause this resets every time the user, the server, or the admin does anything
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

function updatePage(data: any) {
    updateData();
    updatePins();
    const pinData = getPinBusJSON();
    
    const html = ejs.render(document.getElementById("renders")!.getAttribute("render")!, {data: data, pin: pins});
    
    document.getElementById("buses")!.innerHTML = html;
}

function getPinBusJSON() {
    let allTable = <HTMLTableElement> document.getElementById("all-bus-table");
    let rows = allTable.rows;
    let row = <HTMLTableRowElement> rows[0];
    let bus:Bus = new Bus(row);
    let pinBusList:Bus[] = [];
    updatePins();
    for (let j = 1; j < rows.length; j++) {
        row = <HTMLTableRowElement> rows[j];
        if (pins.includes(parseInt(row.firstElementChild!.innerHTML))) {
            bus = new Bus(row);
            pinBusList.push(bus);
        }
    }
    return pinBusList;
}

function pinBus(button: HTMLInputElement) {
    updatePins();
    const busRow = button.parentElement!.parentElement; // this is the overarching <tr> element of the bus row
    const busNumber = busRow!.firstElementChild!.innerHTML; // this is the stringification of the number of the bus
    
    const num = parseInt(busNumber); // this is the number of the bus
    if (pins.includes(num) == false) {
        if (confirm("Do you want to add bus " + num + " to your pins?")) {
            updatePins(); // yes i called it twice. this is not a mistake
            pins.push(num);
            pins.sort();
            let newPinString = pins.join(", "); // representation of the pins list as a string
            localStorage.setItem("pins", newPinString);
        }
    } else {
        if (confirm("Do you want to remove bus " + num + " from your pins?")) {
            updatePins(); 
            pins = pins.filter(function notNum(n: number) {return n != num;}); // this is how you remove elements in js arrays. pain
            pins.sort();
            if (pins.length == 0) {
                localStorage.removeItem("pins");
            } else {
                let newPinString = pins.join(", "); // representation of the pins list as a string
                localStorage.setItem("pins", newPinString);
            }
        }
    }
}

function resetPins() {
    if (confirm("Are you sure you want to clear your pins?")) {
        localStorage.removeItem("pins");
    }
}