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