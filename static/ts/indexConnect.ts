/// <reference path="./socket-io-client.d.ts"/>

const indexSocket = window.io('/'); // This line and the line above is how you get ts types to work on clientside... cursed
let favorites:number[] = [];

window.addEventListener("focus", () => {
    location.reload();
});

indexSocket.on("update", (data) => {
    const html = ejs.render(document.getElementById("getRender")!.getAttribute("render")!, {data: data});
    document.getElementById("content")!.innerHTML = html;
    updateFavoriteArray();
});

function updateFavoriteArray() { // not to be used while updating favorites localStorage
    const favString = localStorage.getItem("favorites");
    if (favString != null && favorites.length == 0) {
        let favArrayString:string[] = favString.split(", ");
        for (const numAsString in favArrayString) {
            let n = parseInt(numAsString);
            if (!favorites.includes(n)) { favorites.push(n); }
        }
    }
}

function favoriteBus(button: HTMLInputElement) {
    const favString = localStorage.getItem("favorites");
    const busNumber = button.parentElement!.parentElement!.firstElementChild!.innerHTML; // despite the name, this is a string
    let num = parseInt(busNumber); // this is the number of the bus
    function notNum(n: number) {return n != num;}

    

    if (!favorites.includes(num)) {
        if (confirm("Do you want to add bus " + num + " to your favorites?")) {
            favorites.push(num);
            favorites.sort();
            if (favorites.length = 0) {localStorage.removeItem("favorites");}
            else if (favorites.length = 1) {localStorage.setItem("favorites", num.toString());}
            else {
                let newFavString = favorites.join(", "); // representation of the favorites list as a string
                localStorage.setItem("favorites", newFavString);
            }
        }
    } else {
        if (confirm("Do you want to remove bus " + num + " from your favorites?")) {
            favorites = favorites.filter(notNum);
            favorites.sort();
            if (favorites.length = 0) {localStorage.removeItem("favorites");}
            else if (favorites.length = 1) {localStorage.setItem("favorites", num.toString());}
            else {
                let newFavString = favorites.join(", "); // representation of the favorites list as a string
                localStorage.setItem("favorites", newFavString);
            }
        }
    }
    
}

