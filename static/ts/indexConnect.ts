/// <reference path="./socket-io-client.d.ts"/>

var indexSocket = window.io('/'); // This line and the line above is how you get ts types to work on clientside... cursed
// !!! do NOT import/export anything or ejs will get angry

var pins: number[] = [];
var weatherFile = fetch('/weather');
var busFile;
var busPromise = fetch('/buses');
busPromise.then((res: Response) => {
    busFile = res.json();
}); 
// code executed when busFile gets its info from the webpage
updatePins();

indexSocket.on("update", (data: any) => {
    updatePins();
    
    // const html = ejs.render(document.getElementById("getRender")!.getAttribute("render")!, {data: data, pin: pins});
    const html = ejs.render(document.getElementById("buses")!.innerHTML, {data: data, pin: pins});

    document.getElementById("buses")!.innerHTML = html;
});

function updateData() { // you will never guess what this does
    weatherFile = fetch('/weather');
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

function updatePage(buses: any, weather: any) {
    updateData();
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