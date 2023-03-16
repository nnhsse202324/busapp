var admins: string[];   
fetch("/whitelistFile").then((data)=>data.json()).then((data) => admins = data);

var newAdminEmptyRow: string;
fetch("/adminEmptyRow").then((res) => res.text()).then((data) => newAdminEmptyRow = data);

//var newAdminRow: string;
// fetch("/adminPopulatedRow").then((res) => res.text()).then((data) => newAdminRow = data);

function addAdmin_admins(newAddress: string) {
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



function removeAdmin_admins(address: string) { 
    console.log(`address to remove: ${address}`)
    console.log(`trimmed address: ${address.trim()}`)
    
    admins.splice(admins.indexOf(address), 1);
    let table: HTMLTableElement = <HTMLTableElement> document.querySelector(".buslist-table");
    let rows = table.children[1].children;
    for(let row of rows){
        console.log(row.children[0].innerHTML)
        if(row.children[0].innerHTML.trim() == address.trim()){
            row.remove();
            break;
        }
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
    })
    

}
