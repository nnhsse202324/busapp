"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeBusList = exports.readBusList = exports.readWhitelist = exports.writeWeather = exports.writeBuses = exports.readData = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const server_1 = require("../server");
const busesDatafile = path_1.default.resolve(__dirname, "../data/buses.json");
const weatherDatafile = path_1.default.resolve(__dirname, "../data/weather.json");
const defaultWeatherDatafile = path_1.default.resolve(__dirname, "../data/defaultWeather.txt");
const whitelistDatafile = path_1.default.resolve(__dirname, "../data/whitelist.json");
const busListDatafile = path_1.default.resolve(__dirname, "../data/busList.json");
// Load data file. If no file exists creates one
function readData() {
    // Makes data files if they don't exist
    if (!fs_1.default.existsSync(busesDatafile)) {
        (0, server_1.resetDatafile)();
    }
    if (!fs_1.default.existsSync(weatherDatafile)) {
        fs_1.default.writeFileSync(weatherDatafile, fs_1.default.readFileSync(defaultWeatherDatafile));
    }
    const buses = JSON.parse(fs_1.default.readFileSync(busesDatafile, "utf-8"));
    const weather = JSON.parse(fs_1.default.readFileSync(weatherDatafile, "utf-8"));
    return { buses: buses, weather: weather };
}
exports.readData = readData;
function writeBuses(data) {
    fs_1.default.writeFileSync(busesDatafile, JSON.stringify(data));
}
exports.writeBuses = writeBuses;
function writeWeather(weather) {
    const data = {
        status: weather.current.condition.text,
        icon: weather.current.condition.icon,
        temperature: weather.current.temp_f,
        feelsLike: weather.current.feelslike_f
    };
    fs_1.default.writeFileSync(weatherDatafile, JSON.stringify(data));
}
exports.writeWeather = writeWeather;
// Reads a list of users who are allowed access to the admin page
function readWhitelist() {
    return { admins: JSON.parse(fs_1.default.readFileSync(whitelistDatafile, "utf-8")) };
}
exports.readWhitelist = readWhitelist;
function readBusList() {
    return { busList: JSON.parse(fs_1.default.readFileSync(busListDatafile, "utf-8")) };
}
exports.readBusList = readBusList;
function writeBusList(data) {
    fs_1.default.writeFileSync(busListDatafile, JSON.stringify(data));
}
exports.writeBusList = writeBusList;
//# sourceMappingURL=jsonHandler.js.map