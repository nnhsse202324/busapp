if('serviceWorker' in navigator){
    //checks if serviceWorkers work within the search engine
    navigator.serviceWorker.register('/serviceWorkers/sw.ts')
        .then((reg) => console.log('service worker registered!', reg))
        .catch((err) => console.log('service worker not registered; error :( ', err))
    //registers serviceWorker "sw.js" If register is successful. ".then" happens. ".catch" catches the error if it doesn't happen for whatever reason.
    //No matter what, this will lead to some value. This is called a promise, as unlike a function, it'll always result in some output.
}