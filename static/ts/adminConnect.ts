/// <reference path="./socket-io-client.d.ts"/>

var adminSocket = window.io('/admin'); 

adminSocket.on("update", (data) => {
    console.log("update received")
    // rerender the page


    console.log(data)

    // convert from time strings to dates to allow conversion to local time
    data.allBuses.forEach((bus) => {
        if (bus.time != "")
            bus.time = new Date(bus.time);
    });

    const html = ejs.render(document.getElementById("getRender")!.getAttribute("render")!, {data: data});
    console.log(html)
    document.getElementById("content")!.innerHTML = html;
    

});

function update() {
    console.log("update called")
    adminSocket.emit("updateMain", {
        type: "update",
    });
}

async function lockWave() {
    await fetch('/lockWave', {
        method: 'POST'
    })
    update()
}

async function updateStatus(button, status) {
    let number = button.parentElement.parentElement.children[0].children[0].value
    let time =  new Date()

    let data = {
        number: number,
        time: time,
        status: status
    }


    await fetch('/updateBusStatus', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })

    update()

    // rerender the page
    // location.reload
}

async function sendWave() {
    await fetch('/sendWave', {
        method: 'POST'
    })
    update()

    // location.reload
}

async function addToWave(button) {
    await updateStatus(button, "Loading")
}

async function removeFromWave(button) {
    await updateStatus(button, "")
}

async function addToNextWave(button) {
    await updateStatus(button, "Next Wave")
}

async function reset(button) {
    await updateStatus(button, "")
}

async function resetAllBusses(button) {
    await fetch('/resetAllBusses', {
        method: 'POST'
    })
    // location.reload
    update()

}

async function updateBusChange(button) {
    // children are number, change, time, status
    let number = button.parentElement.parentElement.children[0].children[0].value
    let change = button.parentElement.parentElement.children[1].children[0].value
    let time =  new Date()

    let data = {
        number: number,
        change: change,
        time: time,
    }
    await fetch('/updateBusChange', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    // location.reload
    update()

}

