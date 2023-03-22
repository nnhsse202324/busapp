var admins: string[];   
fetch("/whitelistFile").then((data)=>data.json()).then((data) => admins = data);

var newAdminEmptyRow: string;
fetch("/adminEmptyRow").then((res) => res.text()).then((data) => newAdminEmptyRow = data);

function addAdmin_admins2(newAddress: string) {
    if(newAddress.includes('@') && newAddress.includes('naperville203.org') && (newAddress.indexOf('@') < newAddress.indexOf('naperville203.org')) && (!admins.includes(newAddress))){
        console.log(newAddress)
        console.log(newAdminEmptyRow)
        const row = (<HTMLTableElement> document.getElementsByClassName("buslist-table")[0]).insertRow(1);
        const html = ejs.render(newAdminEmptyRow,{newAddress: newAddress});
        console.log(html);
        row.innerHTML = html;
        admins.splice(0, 0, newAddress);
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
        })
    }
    
}



async function  save(reset: boolean) {
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

function discardChanges() {
    if (confirm("Are you sure you would like to discard changes?")) location.reload();
}