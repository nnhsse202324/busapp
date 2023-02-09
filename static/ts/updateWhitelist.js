"use strict";
var admins;
fetch("/whitelist").then((data) => data.json()).then((data) => admins = data.body());
let newAdminEmptyRow;
fetch("/adminEmptyRow").then((res) => res.text()).then((data) => newAdminEmptyRow = data);
let newAdminRow;
// fetch("/adminPopulatedRow").then((res) => res.text()).then((data) => newAdminRow = data);
function addAdmin_admins(newAddress) {
    if (newAddress.includes('@') && newAddress.includes('.naperville203.org') && (newAddress.indexOf('@') < newAddress.indexOf('.naperville203.org'))) {
        alert(newAddress);
        console.log(newAddress);
        console.log(newAdminEmptyRow);
        const row = document.getElementsByClassName("buslist-table")[0].insertRow(1);
        const html = ejs.render(newAdminEmptyRow, { newAddress: newAddress });
        console.log(html);
        row.innerHTML = html;
    }
}
function removeAdmin_admins(secondChild) {
    let row = secondChild.parentElement.parentElement;
    let number = row.children[0].innerHTML;
    admins.splice(admins.indexOf(number), 1);
    row.remove();
}
//# sourceMappingURL=updateWhitelist.js.map