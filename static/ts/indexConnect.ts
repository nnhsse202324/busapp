/// <reference path="./socket-io-client.d.ts"/>

const indexSocket = window.io('/'); // This line and the line above is how you get ts types to work on clientside... cursed

window.addEventListener("focus", () => {
    location.reload();
});

indexSocket.on("update", (data) => {
    const html = ejs.render(document.getElementById("getRender")!.getAttribute("render")!, {data: data});
    document.getElementById("content")!.innerHTML = html;
});

function favoriteBus(bus: Bus) {
    localStorage.setItem("selected", `${bus.data.number}`);
    alert(`Do you want to set ${localStorage.getItem("selected")} as your favorite bus?`);
}