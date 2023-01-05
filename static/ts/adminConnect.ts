/// <reference path="./socket-io-client.d.ts"/>

const adminSocket = window.io('/admin'); // This line and the line above is how you get ts types to work on clientside... cursed

window.addEventListener("focus", () => {
    location.reload();
});

class Bus {
    row: HTMLTableRowElement;
    numberInput: HTMLInputElement;
    changeInput: HTMLInputElement;
    arrivalInput: HTMLInputElement;
    statusInput: HTMLInputElement;
    removeIcon: HTMLElement;
    number: string | undefined;
    data: BusData;
    timer: number | undefined;

    constructor(rowVal: HTMLTableRowElement) {
        this.row = rowVal;
        this.numberInput = <HTMLInputElement> this.row.children[0].children[0];
        this.changeInput = <HTMLInputElement> this.row.children[1].children[0];
        this.statusInput = <HTMLInputElement> this.row.children[2].children[0];
        this.arrivalInput = <HTMLInputElement> this.row.children[3].children[0];        
        this.removeIcon = <HTMLElement> this.row.children[4].children[0];
        this.data = {} as BusData;
        this.updateValues();
    }

    updateValues() {
        this.number = this.numberInput.value;
        this.data.number = this.numberInput.value;
        this.data.change = this.changeInput.value;
        this.data.arrival = this.arrivalInput.value;
        this.data.status = this.statusInput.value;
    }
}

type BusData = {
    number: string | undefined,
    change: string | undefined,
    arrival: string | undefined,
    status: string | undefined
}

const buses: Bus[] = []; 

{
    const table = <HTMLTableElement> document.getElementById("table");
    const rows = [...table.rows];
    rows.splice(0, 1);
    rows.forEach((row) => {
        buses.push(new Bus(row));
    });
}

const newBuses: Bus[] = [];

type validAttribute = Exclude<keyof Bus, "data" | "timer">

function getBus(key: HTMLElement, attribute: validAttribute): Bus;
function getBus(key: HTMLInputElement): Bus;
function getBus(key: HTMLElement, attribute?: validAttribute) {
    if (!attribute) {
        attribute = ["numberInput", "changeInput", "arrivalInput", "statusInput"].find((htmlClass) => {
            return key.classList.contains(htmlClass);
        }) as validAttribute;
    }
    const bus = buses.find((bus) => {return bus[attribute!] == key});
    if (bus) return bus;
    throw "Bus not found";  
}

function getNewBus(key: HTMLElement, attribute: validAttribute): Bus;
function getNewBus(key: HTMLInputElement): Bus;
function getNewBus(key: HTMLElement, attribute?: validAttribute) {
    if (!attribute) {
        attribute = ["numberInput", "changeInput", "arrivalInput", "statusInput"].find((htmlClass) => {
            return key.classList.contains(htmlClass);
        }) as validAttribute;
    }
    const bus = newBuses.find((bus) => {return bus[attribute!] == key});
    if (bus) return bus;
    throw "Bus not found";  
}

function printBuses() {
    buses.forEach((bus) => {console.log(bus.data.number)});
}

function newBus() {
    const row = (<HTMLTableElement> document.getElementById("table")).insertRow(1);
    const html = ejs.render(document.getElementById("getRender")!.getAttribute("emptyRow")!);
    row.innerHTML = html;
    const bus = new Bus(row);
    newBuses.splice(0, 0, bus);
    bus.numberInput.focus();
}

function startTimeout(input: HTMLInputElement, type?: string) {
    const bus = (type == "new") ? getNewBus(input) : getBus(input);
    bus.updateValues();
    clearTimeout(bus.timer);
    const func = (type == "new") ? addBus : updateBus;
    bus.timer = window.setTimeout(() => {func(bus)}, 3000);
}

function addBus(bus: Bus) {
    if (!bus.data.number) {
        alert("Bus number is required");
        return;
    }
    for (let otherBus of buses) {
        if (bus != otherBus && bus.data.number == otherBus.data.number) {
            alert("Duplicate bus numbers are not allowed");
            return;
        } 
    }
    bus.row.remove();
    newBuses.splice(newBuses.indexOf(bus), 1);
    sort(bus.data);
    adminSocket.emit("updateMain", {
        type: "add",
        data: bus.data
    });
}

function updateBus(bus: Bus) {
    adminSocket.emit("updateMain", {
        type: "update",
        data: bus.data
    });
}

function cancelBus(icon: HTMLElement) {
    const bus = getNewBus(icon, "removeIcon");
    clearTimeout(bus.timer);
    bus.row.remove();
    newBuses.splice(newBuses.indexOf(bus), 1);   
}

function confirmRemove(icon: HTMLElement) {
    const bus = getBus(icon, "removeIcon");
    if (confirm(`Are you sure you want to delete bus ${bus.data.number}?`)) {
        removeBus(bus);
        adminSocket.emit("updateMain", {
            type: "delete",
            data: {
                number: bus.data.number
            }
        });
    } 
}

function removeBus(bus: Bus) {
    clearTimeout(bus.timer);
    bus.row.remove();
    buses.splice(buses.indexOf(bus), 1);   
}

function sort(bus: BusData) {
    const busAfter = buses.find((otherBus) => {
        return parseInt(bus.number!) < parseInt(otherBus.data.number!);
    });
    let rowIndex: number;
    let busIndex: number;
    if (busAfter) {
        rowIndex = busAfter.row.rowIndex;
        busIndex = buses.indexOf(busAfter);
    }
    else {
        rowIndex = (<HTMLTableElement> document.getElementById("table")).rows.length;
        busIndex = buses.length;
    }
    const row = (<HTMLTableElement> document.getElementById("table")).insertRow(rowIndex);
    const html = ejs.render(document.getElementById("getRender")!.getAttribute("populatedRow")!, {data: bus});
    row.innerHTML = html;
    buses.splice(busIndex, 0, new Bus(row));
}

function statusChange(dropDown: HTMLSelectElement, type?: string) {
    const bus = (type == "new") ? getNewBus(dropDown, "statusInput") : getBus(dropDown, "statusInput");
    if (bus.statusInput.value == "Not Here") {
        bus.arrivalInput.value = "";
    }
    else {
        const date = new Date();
        let hour = parseInt(date.toTimeString().substring(0, 3));
        let minute = date.toTimeString().substring(3, 5);
        let effix: string;
        if (hour > 12)  {
            if (hour == 24) {
                effix = "am";
            }
            else {
                effix = "pm";
            }
            hour -= 12;
        }    
        else {
            if (hour == 12) {
                effix = "pm";
            }
            else {
                effix = "am";
            }
        }
        bus.arrivalInput.value = `${hour}:${minute}${effix}`;    
    }
}

type BusCommand = {
    type: string
    data: BusData
}

adminSocket.on("updateBuses", (command) => {
    let bus: Bus;
    switch (command.type) {
        case "add":
            sort(command.data);
            break;
        case "update":
            bus = getBus(command.data.number, "number");
            const html = ejs.render(document.getElementById("getRender")!.getAttribute("populatedRow")!, {data: command.data});
            bus.row.innerHTML = html;
            buses[buses.indexOf(bus)] = new Bus(bus.row);
            break;
        case "delete":
            bus = getBus(command.data.number, "number");
            removeBus(bus);
            break;
        default:
            throw `Invalid bus command: ${command.type}`;
    }
});

adminSocket.on("updateWeather", (weather) => {
    const html = ejs.render(document.getElementById("getRender")!.getAttribute("weather")!, {weather: weather});
    document.getElementById("weather")!.innerHTML = html;
});