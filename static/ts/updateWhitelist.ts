import {ejs} from "../../node_modules/ejs/ejs.min.js";
import { io } from "socket.io-client";
const socket = io();
var admins: string[];   
fetch("/whitelist").then((data)=>data.json()).then((data) => admins = data.body());

var newAdminEmptyRow: string;
fetch("/adminEmptyRow").then((res) => res.text()).then((data) => newAdminEmptyRow = data);

var newAdminRow: string;
// fetch("/adminPopulatedRow").then((res) => res.text()).then((data) => newAdminRow = data);

function addAdmin_admins(newAddress: string) {
    if(newAddress.includes('@') && newAddress.includes('naperville203.org') && (newAddress.indexOf('@') < newAddress.indexOf('naperville203.org'))){
        alert(newAddress);
        console.log(newAddress)
        console.log(newAdminEmptyRow)
        const row = (<HTMLTableElement> document.getElementsByClassName("buslist-table")[0]).insertRow(1);
        const html = ejs.render(newAdminEmptyRow,{newAddress: newAddress});
        console.log(html);
        row.innerHTML = html;
        socket.emit("addAdmin",newAddress)
    }
    
}

function removeAdmin_admins(secondChild: HTMLElement) {
    let row = secondChild.parentElement!.parentElement! as HTMLTableRowElement;
    row.remove();
}
