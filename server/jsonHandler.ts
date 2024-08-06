import path from "path";
import fs from "fs";

const busesDatafile = path.resolve(__dirname, "../data/buses.json");
const weatherDatafile = path.resolve(__dirname, "../data/weather.json");
const defaultWeatherDatafile = path.resolve(__dirname, "../data/defaultWeather.txt");
const whitelistDatafile = path.resolve(__dirname, "../data/whitelist.json");
const busListDatafile = path.resolve(__dirname, "../data/busList.json");
const Announcement = require("./model/announcement");
const Bus = require("./model/bus");
const Weather = require("./model/weather");

export type BusData = {number: string, change: string | undefined, time: string | undefined, status: string | undefined};
export type adminData = {address: string};

export async function getBuses() {
    // get all the buses and create a list of objects like the following {number:,change:,time:,status:}
    const buses: any[] = await Bus.find({});
    const busList: any[] = [];
    buses.forEach((bus: any) => {
        busList.push({number: bus.busNumber, change: bus.busChange, time: bus.time, status: bus.status});
    });
    // if change is 0, make it an empty string
    busList.forEach((bus: any) => {
        if (bus.change === 0) bus.change = "";
        if(bus.time == undefined) bus.time = new Date();
        if (bus.status === "normal") bus.status = "";
        // bus.time = bus.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        if(bus.status === "") bus.time = "";
    });

    // sort the list by bus number
    busList.sort((a: any, b: any) => {
        return a.number - b.number;
    });

    return busList;
}


// Load data file. If no file exists creates one
export async function readData() {

    
    const weather = await Weather.findOne({})
    let buses = await getBuses();

    return {buses: buses, weather: weather, announcement: (await Announcement.findOne({})).announcement};
}

export function writeBuses(data: BusData[]){
    fs.writeFileSync(busesDatafile, JSON.stringify(data));
}

export async function writeWeather(weather: any) {
        const doc = await Weather.findOneAndUpdate({}, {
            status: weather.current.condition.text,
            icon: weather.current.condition.icon,
            temperature: weather.current.temp_f,
            feelsLike: weather.current.feelslike_f
        }, {upsert: true, returnDocument: "after"});
    
}

// Reads a list of users who are allowed access to the admin page
export function readWhitelist(): {admins: string[]} {
    return {admins: JSON.parse(fs.readFileSync(whitelistDatafile, "utf-8"))};
}

export function readWeather(): {weather: string[]} {
    return {weather: JSON.parse(fs.readFileSync(weatherDatafile, "utf-8"))};
}

export function readBusList(): {busList: string[]} {
    return {busList: JSON.parse(fs.readFileSync(busListDatafile, "utf-8"))};
}

export function readBusStatus(): {busList: string[]} {
    return {busList: JSON.parse(fs.readFileSync(busesDatafile, "utf-8"))};
}

export function writeBusList(data: string[]) {
    fs.writeFileSync(busListDatafile, JSON.stringify(data));
}
/*
export function writeWhitelist(data: string[]) {
    fs.writeFileSync(whitelistDatafile, JSON.stringify(data));
}
*/
export function writeWhitelist(data: string) {
    let oldWhitelist: string[] = readWhitelist().admins;
    oldWhitelist.push(data)
    fs.writeFileSync(whitelistDatafile, JSON.stringify(oldWhitelist));
}