/// <reference path="./socket-io-client.d.ts"/>

var indexSocket = window.io('/'); // This line and the line above is how you get ts types to work on clientside... cursed
// !!! do NOT import/export anything or ejs will get angry

var pins: number[] = [];
var tableFull:HTMLTableElement;
updateData();
updatePins();

// end of initializing stuff

function updateData() { // updates the weather and the list of buses
    var weatherPromise = fetch('/weather');
    weatherPromise.then(res => res.json()).then(res => res.weather).then((res: JSON) => {
        const htmlWeather = ejs.render(document.getElementById("header-div")!.innerHTML, {data: res})
        document.getElementById("header-div")!.innerHTML = htmlWeather;
    });

    var busPromise = fetch('/buses');
    busPromise.then(res => res.json()).then(res => res.busList).then((data) => { // h
        let html = document.getElementById("buses") ? document.getElementById("buses")!.innerHTML : "";
        const htmlBuses = ejs.render(html, {data: data})
        document.getElementById("buses")!.innerHTML = htmlBuses;
        tableFull = <HTMLTableElement> document.getElementById("all-bus-table");
        // ... then converts it into just the pins
        let tablePins = <HTMLTableElement> document.getElementById("pin-bus-table");
        let pinRows = tablePins.rows;
        updatePins();
        
        for (let i = 1; i < pinRows.length - 1; i++) { // hides rows that aren't in the pins
            let number = parseInt(pinRows[i]!.firstElementChild!.innerHTML)
            pinRows[i].hidden = !pins.includes(number)
        }

        pinRows[pinRows.length - 1].hidden = !(pins.length == 0);
    }); 
}
let dataInterval = setInterval(updateData, 3000); // updates the weather/buses every 3000 milliseconds

function resetInterval() { // resets the 3000ms interval
    updateData();
    clearInterval(dataInterval);
    dataInterval = setInterval(updateData, 3000);
}


indexSocket.on("update", (data: any) => {
    let html = document.getElementById("buses") ? document.getElementById("buses")!.innerHTML : "";
    const htmlBuses = ejs.render(html, {data: data})
    document.getElementById("buses")!.innerHTML = htmlBuses;
    console.log("update");
    resetInterval();
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

function updatePage(buses: any, weather: any) {
    updatePins();
    let pinBus = {"busList":[]};
    for (let n of pins) {
    }    
    
    const html = ejs.render(document.getElementById("getRender")!.getAttribute("render")!, {data: buses, pin: pins});
    
    document.getElementById("buses")!.innerHTML = html;
}

function pinBus(button: HTMLInputElement) {
    updatePins();
    const busRow = button.parentElement!.parentElement; // this is the overarching <tr> element of the bus row
    const busNumber = busRow!.firstElementChild!.innerHTML; // this is the stringification of the number of the bus
    
    const num = parseInt(busNumber); // this is the number of the bus
    if (pins.includes(num) == false) {
        // if (confirm("Do you want to add bus " + num + " to your pins?")) {
            updatePins(); // yes i called it twice. this is not a mistake
            pins.push(num);
            pins.sort();
            let newPinString = pins.join(", "); // representation of the pins list as a string
            localStorage.setItem("pins", newPinString);
        // }
    } else {
        // if (confirm("Do you want to remove bus " + num + " from your pins?")) {
            updatePins(); 
            pins = pins.filter(function notNum(n: number) {return n != num;}); // this is how you remove elements in js arrays. pain
            pins.sort();
            if (pins.length == 0) {
                localStorage.removeItem("pins");
            } else {
                let newPinString = pins.join(", "); // representation of the pins list as a string
                localStorage.setItem("pins", newPinString);
            }
        // }
    }

    resetInterval();
}

function resetPins() {
    if (confirm("Are you sure you want to clear your pins?")) {
        localStorage.removeItem("pins");
    }
}