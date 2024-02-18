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
var countDownDate = (() => __awaiter(void 0, void 0, void 0, function* () { yield fetch('/getCountDownDate').then(res => res.json()); }))();
console.log(countDownDate);
// Update the count down every 1 second
var x = setInterval(function () {
    // Get today's date and time
    var now = new Date().getTime();
    // Find the distance between now and the count down date
    var distance = Number(countDownDate) - Number(now);
    // Time calculations for days, hours, minutes and seconds
    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
    // Display the result in the element with id="demo"
    document.getElementById("timer").innerHTML = days + "d " + hours + "h "
        + minutes + "m " + seconds + "s ";
    // If the count down is finished, write some text
    if (distance < 0) {
        clearInterval(x);
        document.getElementById("timer").innerHTML = "EXPIRED";
    }
}, 1000);
function lockWave() {
    fetch('/lockWave', {
        method: 'POST'
    });
    location.reload();
}
function updateStatus(button, status) {
    let number = button.parentElement.parentElement.children[0].children[0].value;
    let time = new Date();
    let data = {
        number: number,
        time: time,
        status: status
    };
    fetch('/updateBusStatus', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    // rerender the page
    location.reload();
}
function sendWave() {
    fetch('/sendWave', {
        method: 'POST'
    });
    //location.reload()
}
function addToWave(button) {
    updateStatus(button, "Loading");
}
function removeFromWave(button) {
    updateStatus(button, "");
}
function addToNextWave(button) {
    updateStatus(button, "Next Wave");
}
function reset(button) {
    updateStatus(button, "");
}
function updateBusChange(button) {
    // children are number, change, time, status
    let number = button.parentElement.parentElement.children[0].children[0].value;
    let change = button.parentElement.parentElement.children[1].children[0].value;
    let time = new Date();
    let data = {
        number: number,
        change: change,
        time: time,
    };
    fetch('/updateBusChange', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    location.reload();
}
//# sourceMappingURL=adminConnect.js.map