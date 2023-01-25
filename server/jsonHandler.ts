import path from "path";
import fs from "fs";
import {resetDatafile} from "../server";

const busesDatafile = path.resolve(__dirname, "../data/buses.json");
const weatherDatafile = path.resolve(__dirname, "../data/weather.json");
const defaultWeatherDatafile = path.resolve(__dirname, "../data/defaultWeather.txt");
const whitelistDatafile = path.resolve(__dirname, "../data/whitelist.json");
const busListDatafile = path.resolve(__dirname, "../data/busList.json");

export type BusData = {number: string, change: string | undefined, time: string | undefined, status: string | undefined};
type Weather = {status: string, icon: string, temperature: string, feelsLike: string}

// Load data file. If no file exists creates one
export function readData() {
    // Makes data files if they don't exist
    if (!fs.existsSync(busesDatafile)) {
        resetDatafile()
    }
    if (!fs.existsSync(weatherDatafile)) {
        fs.writeFileSync(weatherDatafile, fs.readFileSync(defaultWeatherDatafile));
    }

    const buses = <BusData[]> JSON.parse(fs.readFileSync(busesDatafile, "utf-8"));
    const weather = <Weather> JSON.parse(fs.readFileSync(weatherDatafile, "utf-8"));
    return {buses: buses, weather: weather};
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

export function readBusList(): {busList: string[]} {
    return {busList: JSON.parse(fs.readFileSync(busListDatafile, "utf-8"))};
}

export function writeBusList(data: string[]) {
    fs.writeFileSync(busListDatafile, JSON.stringify(data));
}