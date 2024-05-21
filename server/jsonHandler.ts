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
type Weather = {status: string, icon: string, temperature: string, feelsLike: string}


// Load data file. If no file exists creates one
export async function readData() {

    
    const weather = await Weather.findOne({})
    let buses = await Bus.find({});

    buses = buses.map((bus) => ({
        number: bus.busNumber || '',
        change: bus.busChange || '',
        time: bus.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) || '',
        status: bus.status || ''
    }));

    return {buses: buses, weather: weather, announcement: (await Announcement.findOne({})).announcement};
}

export function writeBuses(data: BusData[]){
    fs.writeFileSync(busesDatafile, JSON.stringify(data));
}

export function writeWeather(weather: any) {
    const data: Weather = {
        status: <string> weather.current.condition.text,
        icon: <string> weather.current.condition.icon,
        temperature: <string> weather.current.temp_f,
        feelsLike: <string> weather.current.feelslike_f
    }
    fs.writeFileSync(weatherDatafile, JSON.stringify(data));
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