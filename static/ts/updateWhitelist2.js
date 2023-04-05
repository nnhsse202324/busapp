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
var admins;
fetch("/whitelistFile").then((data) => data.json()).then((data) => admins = data);
var newAdminEmptyRow;
fetch("/adminEmptyRow").then((res) => res.text()).then((data) => newAdminEmptyRow = data);
function addAdmin_admins2() {
    const row = document.getElementsByClassName("buslist-table")[0].insertRow(2);
    const html = ejs.render(newAdminEmptyRow);
    row.innerHTML = html;
    let input = row.children[0].children[0];
    input.focus();
}
function save2(reset) {
    return __awaiter(this, void 0, void 0, function* () {
        if (reset) {
            if (!confirm("Are you sure you would like to update the admin list?"))
                return;
        }
        else {
            if (!confirm("Are you sure you would like to update the admin list?"))
                return;
        }
        fetch("/whitelistFile", {
            method: 'POST',
            headers: {
                accept: 'application.json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                admins: admins
            })
        });
    });
}
function discardChanges2() {
    if (confirm("Are you sure you would like to discard changes?"))
        location.reload();
}
//# sourceMappingURL=updateWhitelist2.js.map