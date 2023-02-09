/// <reference path="./socket-io-client.d.ts"/>

const indexSocket = window.io('/'); // This line and the line above is how you get ts types to work on clientside... cursed
var pins: number[] = [];

window.addEventListener("focus", () => {
    location.reload();
});

indexSocket.on("update", (data) => {
    const html = ejs.render(document.getElementById("getRender")!.getAttribute("render")!, {data: data});
    document.getElementById("content")!.innerHTML = html;
    updateFavoriteArray();
});

function updateFavoriteArray() { // not to be used while updating pins localStorage
    const pinString = localStorage.getItem("pins"); 
    if (pinString != null){
        let pinArrayString:string[] = pinString.split(", ");
        for (let i = 0; i < pins.length; i++) {
            pins.pop();
        }
        for (let i = 0; i < pinArrayString.length; i++) {
            let n = parseInt(pinArrayString[i]);
            if (!pins.includes(n)) { pins.push(n); }
        }
    }
}

function favoriteBus(button: HTMLInputElement) {
    updateFavoriteArray();

    const busNumber = button.parentElement!.parentElement!.firstElementChild!.innerHTML; // despite the name, this is a string
    let num = parseInt(busNumber); // this is the number of the bus
    
    if (!pins.includes(num)) {
        if (confirm("Do you want to add bus " + num + " to your pins?")) {
            pins.push(num);
            pins.sort();
            let newPinString = pins.join(", "); // representation of the pins list as a string
            localStorage.setItem("pins", newPinString);
        }
    } else {
        if (confirm("Do you want to remove bus " + num + " from your pins?")) {
            pins = pins.filter(function notNum(n: number) {return n != num;});
            pins.sort();
            if (pins.length == 0) {
                localStorage.removeItem("pins");
            } else {
                let newPinString = pins.join(", "); // representation of the pins list as a string
                localStorage.setItem("pins", newPinString);
            }
        }
    }
    updateFavoriteArray();
}

