/// <reference path="./socket-io-client.d.ts"/>

var indexSocket = window.io('/'); // This line and the line above is how you get ts types to work on clientside... cursed
// !!! do NOT import/export anything or ejs will get angry

var pins: number[] = [];
updatePins();

indexSocket.on("update", (data: any) => {
    let inPins: number[] = [];
    let inPinsBus: Bus[] = [];
    updatePins();
    for (let i = 0; i < data.buses.length(); i++) { // filter numbers based on whether or not they are in the pinlist
        if (pins.includes(data.buses[i].number)) {
            inPins.push(data.buses[i].number);
            inPinsBus.push(data.buses[i]);
        }
    }
    const pinData = {buses: inPinsBus, weather: data.weather};

    const htmlPins = ejs.render(document.getElementById("renderPins")!.getAttribute("render")!, {data: pinData});
    const htmlAll = ejs.render(document.getElementById("renderAll")!.getAttribute("render")!, {data: data});

    document.getElementById("pinBus")!.innerHTML = htmlPins;
    document.getElementById("allBus")!.innerHTML = htmlAll;
    updatePins();
    updatePinTable();
});

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

function updatePinTable() {
    let allTable:HTMLTableElement = <HTMLTableElement> document.getElementById("all-bus-table");
    let rows = allTable.rows;
    let row:HTMLTableRowElement = <HTMLTableRowElement> rows[0];
    updatePins();
    for (let j = 1; j < rows.length; j++) {
        row = rows[j];
        let num:number = parseInt(row.firstElementChild!.innerHTML);
        if (pins.includes(num)) {
            allTable.deleteRow(j);
        }
    }
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
    updatePinTable();
}



function resetPins() {
    if (confirm("Are you sure you want to clear your pins?")) {
        localStorage.removeItem("pins");
    }
}