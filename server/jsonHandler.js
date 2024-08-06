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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeWhitelist = exports.writeBusList = exports.readBusStatus = exports.readBusList = exports.readWeather = exports.readWhitelist = exports.writeWeather = exports.writeBuses = exports.readData = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const busesDatafile = path_1.default.resolve(__dirname, "../data/buses.json");
const weatherDatafile = path_1.default.resolve(__dirname, "../data/weather.json");
const defaultWeatherDatafile = path_1.default.resolve(__dirname, "../data/defaultWeather.txt");
const whitelistDatafile = path_1.default.resolve(__dirname, "../data/whitelist.json");
const busListDatafile = path_1.default.resolve(__dirname, "../data/busList.json");
const Announcement = require("./model/announcement");
const Bus = require("./model/bus");
const Weather = require("./model/weather");
// Load data file. If no file exists creates one
function readData() {
    return __awaiter(this, void 0, void 0, function* () {
        const weather = yield Weather.findOne({});
        let buses = yield Bus.find({});
        buses = buses.map((bus) => ({
            number: bus.busNumber || '',
            change: bus.busChange || '',
            time: bus.time || '',
            status: bus.status || ''
        }));
        return { buses: buses, weather: weather, announcement: (yield Announcement.findOne({})).announcement };
    });
}
exports.readData = readData;
function writeBuses(data) {
    fs_1.default.writeFileSync(busesDatafile, JSON.stringify(data));
}
exports.writeBuses = writeBuses;
function writeWeather(weather) {
    return __awaiter(this, void 0, void 0, function* () {
        const doc = yield Weather.findOneAndUpdate({}, {
            status: weather.current.condition.text,
            icon: weather.current.condition.icon,
            temperature: weather.current.temp_f,
            feelsLike: weather.current.feelslike_f
        }, { upsert: true, returnDocument: "after" });
    });
}
exports.writeWeather = writeWeather;
// Reads a list of users who are allowed access to the admin page
function readWhitelist() {
    return { admins: JSON.parse(fs_1.default.readFileSync(whitelistDatafile, "utf-8")) };
}
exports.readWhitelist = readWhitelist;
function readWeather() {
    return { weather: JSON.parse(fs_1.default.readFileSync(weatherDatafile, "utf-8")) };
}
exports.readWeather = readWeather;
function readBusList() {
    return { busList: JSON.parse(fs_1.default.readFileSync(busListDatafile, "utf-8")) };
}
exports.readBusList = readBusList;
function readBusStatus() {
    return { busList: JSON.parse(fs_1.default.readFileSync(busesDatafile, "utf-8")) };
}
exports.readBusStatus = readBusStatus;
function writeBusList(data) {
    fs_1.default.writeFileSync(busListDatafile, JSON.stringify(data));
}
exports.writeBusList = writeBusList;
/*
export function writeWhitelist(data: string[]) {
    fs.writeFileSync(whitelistDatafile, JSON.stringify(data));
}
*/
function writeWhitelist(data) {
    let oldWhitelist = readWhitelist().admins;
    oldWhitelist.push(data);
    fs_1.default.writeFileSync(whitelistDatafile, JSON.stringify(oldWhitelist));
}
exports.writeWhitelist = writeWhitelist;
//# sourceMappingURL=jsonHandler.js.map