/// <reference path="./socket-io-client.d.ts"/>
//import { register } from "ts-node";


const indexSocket = window.io('/'); // This line and the line above is how you get ts types to work on clientside... cursed

window.addEventListener("focus", () => {
    location.reload();
});

indexSocket.on("update", (data) => {
    const html = ejs.render(document.getElementById("getRender")!.getAttribute("render")!, {data: data});
    document.getElementById("content")!.innerHTML = html;
});

if('serviceWorker' in navigator){
    //navigator represents browser and info about it. Checking if service worker works on browser that's running website.
    //checks if serviceWorkers work within the search engine
    navigator.serviceWorker.register('/sw.js')
    //Gets file and registers "sw.js", and returns a promise.
        .then(() => console.log('service worker registered!'))
        // calls function when promise is resolved
        .catch(() => console.log('service worker not registered; error :( '))
        //calls function when promise is rejected
    //No matter what, this will lead to some value. This is called a promise, as unlike a function, it'll always result in some output.
    
}
/*Notification.requestPermission(
    function(status){
        console.log('Notif permission status:', status);
});
    if (Notification.permission === 'granted') {
        navigator.serviceWorker.getRegistration()
        .then(function(reg2){
            reg2!.showNotification('Notification system on line.')
            console.log('it works, notification should pop up')
        });
        
} */
var test = new Notification("fhvukahfiwenhifwhnvhaovnw")  
test.onclick = () => { 
    test.close();
    window.parent.focus();
}



  
