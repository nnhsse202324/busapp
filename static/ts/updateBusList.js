"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let busList;
fetch("/busList").then((res) => res.json()).then((data) => busList = data);
let newBusEmptyRow;
fetch("/updateBusListEmptyRow").then((res) => res.text()).then((data) => newBusEmptyRow = data);
let newBusRow;
fetch("/updateBusListPopulatedRow").then((res) => res.text()).then((data) => newBusRow = data);
function newBus_busList() {
    const row = document.getElementsByClassName("buslist-table")[0].insertRow(2);
    const html = ejs.render(newBusEmptyRow);
    row.innerHTML = html;
    let input = row.children[0].children[0];
    input.focus();
}
function addBus_busList(confirmButton) {
    let row = confirmButton.parentElement.parentElement;
    let number = row.children[0].children[0].value;
    if (busList.includes(number)) {
        alert("Duplicate buses are not allowed");
        return;
    }
    let index = busList.findIndex((currentNumber) => { return parseInt(number) < parseInt(currentNumber); });
    if (index == -1)
        index = busList.length;
    busList.splice(index, 0, number);
    row.remove();
    const newRow = document.getElementsByClassName("buslist-table")[0].insertRow(index + 2);
    const html = ejs.render(newBusRow, { number: number });
    newRow.innerHTML = html;
}
function removeBus_busList(secondChild) {
    let row = secondChild.parentElement.parentElement;
    let number = row.children[0].innerHTML;
    busList.splice(busList.indexOf(number), 1);
    row.remove();
}
function save(reset) {
    return __awaiter(this, void 0, void 0, function* () {
        if (reset) {
            if (!confirm("Are you sure you would like to update the bus list and reset all live pages?"))
                return;
        }
        else {
            if (!confirm("Are you sure you would like to update the bus list? (This will not changes any active pages until midnight)"))
                return;
        }
        fetch("/updateBusList", {
            method: 'POST',
            headers: {
                accept: 'application.json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                busList: busList,
                reset: reset
            })
        });
    });
}
function discardChanges() {
    if (confirm("Are you sure you would like to discard changes?"))
        location.reload();
}
//# sourceMappingURL=updateBusList.js.map