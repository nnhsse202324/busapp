/// <reference path="./socket-io-client.d.ts"/>

const indexSocket = window.io('/'); // This line and the line above is how you get ts types to work on clientside... cursed
var pins: number[] = [];

window.addEventListener("focus", () => {
    location.reload();
});

indexSocket.on("update", (data) => {
    let inPins: number[] = [];
    let notPins: number[] = [];
    
    let inPinsBus: Bus[] = [];
    let notPinsBus: Bus[] = [];
    updatePins();
    for (let i = 0; i < data.buses.length(); i++) { // filter numbers into in the pin list or not
        if (pins.includes(data.buses[i].number)) {
            inPins.push(data.buses[i].number);
        } else {
            notPins.push(data.buses[i].number);
        }
    }

    

    const htmlPins = ejs.render(document.getElementById("renderPins")!.getAttribute("render")!, {data: inPins});
    const htmlAll = ejs.render(document.getElementById("renderAll")!.getAttribute("render")!, {data: data});

    document.getElementById("pinBus")!.innerHTML = htmlPins;
    document.getElementById("allBus")!.innerHTML = htmlAll;

    updatePins();
});

function updatePins() { // call often cause this [censored] resets every time the user does anything
    const pinString = localStorage.getItem("pins"); 
    for (let i = 0; i < pins.length; i++) {
        pins.pop();
    }
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
    const busNumber = button.parentElement!.parentElement!.firstElementChild!.innerHTML; // despite the name, this is a string
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
    updatePins();
    for (let i = 0; i < pins.length; i++) {
        console.log(pins[i].toString());
    }
}



function resetPins() {
    if (confirm("Are you sure you want to clear your pins?")) {
        localStorage.removeItem("pins");
    }
}