var admins: string[];   
fetch("/whitelistFile").then((data)=>data.json()).then((data) => admins = data);

var newAdminEmptyRow: string;
fetch("/adminEmptyRow").then((res) => res.text()).then((data) => newAdminEmptyRow = data);

//var newAdminRow: string;
// fetch("/adminPopulatedRow").then((res) => res.text()).then((data) => newAdminRow = data);

function addAdmin_admins(newAddress: string) {
    if(newAddress.includes('@') && newAddress.includes('naperville203.org') && (newAddress.indexOf('@') < newAddress.indexOf('naperville203.org'))){
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



function removeAdmin_admins(secondChild: HTMLElement) {
    let row = secondChild.parentElement!.parentElement! as HTMLTableRowElement;
    row.remove();
    //admins.splice(admins.indexOf(,));
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
