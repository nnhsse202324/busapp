var admins: string[];   
fetch("/whitelistFile").then((data)=>data.json()).then((data) => admins = data);

var newAdminEmptyRow: string;
fetch("/adminEmptyRow").then((res) => res.text()).then((data) => newAdminEmptyRow = data);
 
function addAdmin_admins2() {
    const row = (<HTMLTableElement> document.getElementsByClassName("buslist-table")[0]).insertRow(2);
    const html = ejs.render(newAdminEmptyRow);
    row.innerHTML = html;
    let input = row.children[0]!.children[0] as HTMLInputElement;
    input.focus();
    
}

function addAdmin_admins3(e: HTMLElement) {
    console.log(e)
    let row = e.parentElement!.parentElement! as HTMLTableRowElement;
    let admin = (row.children[0]!.children[0] as HTMLInputElement).value;
    if (admins.includes(admin)) {
        alert("Duplicate admins are not allowed");
        return;
    }
    const newRow = (<HTMLTableElement> document.getElementsByClassName("buslist-table")[0]).insertRow(2);
    const html = ejs.render(newAdminEmptyRow, {newAddress: admin});
    newRow.innerHTML = html;
}

function removeAdmin_admins2(secondChild: HTMLElement) {
    let row = secondChild.parentElement!.parentElement! as HTMLTableRowElement;
    let admin = row.children[0]!.innerHTML;
    busList.splice(admins.indexOf(admin), 1);
    row.remove();
}



async function  save2(reset: boolean) {
    if (reset) {
        if (!confirm("Are you sure you would like to update the admin list?")) return;
    }
    else {
        if(!confirm("Are you sure you would like to update the admin list?")) return;
    }

    fetch("/whitelistFile", {
        method: 'POST',
        headers: {
        accept: 'application.json',
        'Content-Type': 'application/json'
        },
        body: 
        JSON.stringify({
           admins: admins
        })
    });
}

function discardChanges2() {
    if (confirm("Are you sure you would like to discard changes?")) location.reload();
}