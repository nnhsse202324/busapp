let busList: string[];
fetch("/busList").then((res) => res.json()).then((data) => busList = data);

let newBusEmptyRow: string;
fetch("/updateBusListEmptyRow").then((res) => res.text()).then((data) => newBusEmptyRow = data);

let newBusRow: string;
fetch("/updateBusListPopulatedRow").then((res) => res.text()).then((data) => newBusRow = data);

function newBus_busList() {
    const row = (<HTMLTableElement> document.getElementsByClassName("buslist-table")[0]).insertRow(2);
    const html = ejs.render(newBusEmptyRow);
    row.innerHTML = html;
    let input = row.children[0]!.children[0] as HTMLInputElement;
    input.focus();
}

function addBus_busList(confirmButton: HTMLElement) {
    let row = confirmButton.parentElement!.parentElement! as HTMLTableRowElement;
    let number = (row.children[0]!.children[0] as HTMLInputElement).value;
    if (busList.includes(number)) {
        alert("Duplicate buses are not allowed");
        return;
    }
    let index = busList.findIndex((currentNumber) => {return parseInt(number) < parseInt(currentNumber)});
    if (index == -1) index = busList.length;
    busList.splice(index, 0, number);
    row.remove();
    const newRow = (<HTMLTableElement> document.getElementsByClassName("buslist-table")[0]).insertRow(index + 2);
    const html = ejs.render(newBusRow, {number: number});
    newRow.innerHTML = html;
}

function removeBus_busList(secondChild: HTMLElement) {
    let row = secondChild.parentElement!.parentElement! as HTMLTableRowElement;
    let number = row.children[0]!.innerHTML;
    busList.splice(busList.indexOf(number), 1);
    row.remove();
}

async function  save(reset: boolean) {
    if (reset) {
        if (!confirm("Are you sure you would like to update the bus list and reset all live pages?")) return;
    }
    else {
        if(!confirm("Are you sure you would like to update the bus list? (This will not changes any active pages until midnight)")) return;
    }

    fetch("/updateBusList", {
        method: 'POST',
        headers: {
          accept: 'application.json',
          'Content-Type': 'application/json'
        },
        body: 
        JSON.stringify({
            busList: busList,
            reset: reset
        })
    });
}

function discardChanges() {
    if (confirm("Are you sure you would like to discard changes?")) location.reload();
}