"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ejs_min_js_1 = require("../../node_modules/ejs/ejs.min.js");
const socket_io_client_1 = require("socket.io-client");
const socket = (0, socket_io_client_1.io)();
var admins;
fetch("/whitelist").then((data) => data.json()).then((data) => admins = data.body());
var newAdminEmptyRow;
fetch("/adminEmptyRow").then((res) => res.text()).then((data) => newAdminEmptyRow = data);
var newAdminRow;
// fetch("/adminPopulatedRow").then((res) => res.text()).then((data) => newAdminRow = data);
function addAdmin_admins(newAddress) {
    if (newAddress.includes('@') && newAddress.includes('naperville203.org') && (newAddress.indexOf('@') < newAddress.indexOf('naperville203.org'))) {
        alert(newAddress);
        console.log(newAddress);
        console.log(newAdminEmptyRow);
        const row = document.getElementsByClassName("buslist-table")[0].insertRow(1);
        const html = ejs_min_js_1.ejs.render(newAdminEmptyRow, { newAddress: newAddress });
        console.log(html);
        row.innerHTML = html;
        socket.emit("addAdmin", newAddress);
    }
}
function removeAdmin_admins(secondChild) {
    let row = secondChild.parentElement.parentElement;
    row.remove();
}
//# sourceMappingURL=updateWhitelist.js.map