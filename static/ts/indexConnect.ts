/// <reference path="./socket-io-client.d.ts"/>

const indexSocket = window.io('/'); // This line and the line above is how you get ts types to work on clientside... cursed
var pins: number[] = [];

window.addEventListener("focus", () => {
    location.reload();
});

indexSocket.on("update", (data) => {
    
    let inPins: number[] = [];
    let inPinsBus: Bus[] = [];
    updatePins();
    for (let i = 0; i < data.buses.length(); i++) { // filter numbers into in the pin list or not
        if (pins.includes(data.buses[i].number)) {
            inPins.push(data.buses[i].number);
            inPinsBus.push(data.buses[i]);
        }
    }
    const pinData = {buses: inPinsBus, weather: data.weather};

    const htmlPins = ejs.render(document.getElementById("renderPins")!.getAttribute("render")!, {data: pinData});
    const htmlAll = ejs.render(document.getElementById("renderAll")!.getAttribute("render")!, {data: data});
    // @ts-ignore
    document.getElementById("pinBus").innerHTML = htmlPins;
    // @ts-ignore
    document.getElementById("allBus").innerHTML = htmlAll;
    
    updatePins();
});

function updatePins() { // call often cause this [censored] resets every time the user does anything
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
    const busRow = button.parentElement!.parentElement; // the <tr> element
    const busRowElements = busRow!.children;
    const busNumber = busRowElements[0].innerHTML;
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

    // update the webpage
    updatePins();
    /*
    for (let i = 0; i < pins.length; i++) {
        console.log(pins[i].toString());
    } */
    let inPinsBus: Bus[] = [];
    for (let i = 0; i < pins.length; i++) {

    }
}



function resetPins() {
    if (confirm("Are you sure you want to clear your pins?")) {
        localStorage.removeItem("pins");
    }
}