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
exports.resetDatafile = void 0;
const express_1 = __importDefault(require("express"));
const router_1 = require("./server/router");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const jsonHandler_1 = require("./server/jsonHandler");
const weatherController_1 = require("./server/weatherController");
const express_session_1 = __importDefault(require("express-session"));
const dotenv = require("dotenv");
const connectDB = require("./server/database/connection");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer);
dotenv.config({ path: ".env" });
connectDB();
const PORT = process.env.PORT || 5182;
const busesDatafile = path_1.default.resolve(__dirname, "./data/buses.json");
const defaultBusesDatafile = path_1.default.resolve(__dirname, "./data/defaultBuses.txt");
let buses;
resetDatafile();
//root socket
io.of("/").on("connection", (socket) => {
    //console.log(`new connection on root (id:${socket.id})`);
    socket.on("debug", (data) => {
        console.log(`debug(root): ${data}`);
    });
});
//admin socket
io.of("/admin").on("connection", (socket) => {
    socket.on("updateMain", (command) => __awaiter(void 0, void 0, void 0, function* () {
        switch (command.type) {
            case "add":
                const busAfter = buses.find((otherBus) => {
                    return parseInt(command.data.number) < parseInt(otherBus.number);
                });
                let index;
                if (busAfter) {
                    index = buses.indexOf(busAfter);
                }
                else {
                    index = buses.length;
                }
                buses.splice(index, 0, command.data);
                break;
            case "update":
                buses[buses.indexOf(buses.find((bus) => { return bus.number == command.data.number; }))] = command.data;
                break;
            case "delete":
                buses.splice(buses.indexOf(buses.find((bus) => { return bus.number == command.data.number; })), 1);
                break;
            default:
                throw `Invalid bus command: ${command.type}`;
        }
        (0, jsonHandler_1.writeBuses)(buses);
        // buses.forEach((bus) => {console.log(bus.number)});
        io.of("/").emit("update", yield (0, jsonHandler_1.readData)());
        socket.broadcast.emit("updateBuses", command);
    }));
    socket.on("debug", (data) => {
        console.log(`debug(admin): ${data}`);
    });
});
app.set("view engine", "ejs"); // Allows res.render() to render ejs
app.use((0, express_session_1.default)({
    secret: "KQdqLPDjaGUWPXFKZrEGYYANxsxPvFMwGYpAtLjCCcN",
    resave: true,
    saveUninitialized: true
})); // Allows use of req.session
app.use(express_1.default.json());
app.use("/", router_1.router); // Imports routes from server/router.ts
app.use("/css", express_1.default.static(path_1.default.resolve(__dirname, "static/css")));
app.use("/js", express_1.default.static(path_1.default.resolve(__dirname, "static/ts")));
app.use("/img", express_1.default.static(path_1.default.resolve(__dirname, "static/img")));
app.use('/html', express_1.default.static(path_1.default.resolve(__dirname, "static/html")));
(0, weatherController_1.startWeather)(io);
// Code to reset bus list automatically at midnight
function resetBuses() {
    resetDatafile();
    setInterval(resetDatafile, 86400000);
}
function resetDatafile() {
    return __awaiter(this, void 0, void 0, function* () {
        let newBuses = [];
        (0, jsonHandler_1.readBusList)().busList.forEach((number) => newBuses.push({ number: number, change: "", time: "", status: "Not Here" }));
        fs_1.default.writeFileSync(busesDatafile, JSON.stringify(newBuses));
        buses = newBuses;
        io.of("/").emit("update", yield (0, jsonHandler_1.readData)());
        io.of("/admin").emit("restart");
    });
}
exports.resetDatafile = resetDatafile;
const midnight = new Date();
midnight.setDate(midnight.getDate() + 1);
midnight.setHours(5, 0, 0, 0);
setTimeout(resetBuses, midnight.valueOf() - new Date().valueOf());
// Starts server
httpServer.listen(PORT, () => { console.log(`Server is running on port ${PORT}`); });
//whitelist socket
// io.of("/whitelist").on("connection", (socket) => {
//     socket.on("addAdmin", (newAdmin: string) => {
//         //add admin to whitelist with jsonHandler.ts functions
//         writeWhitelist(newAdmin);
//     });
//     socket.on(  "debug", (data) => {
//         console.log(`debug(admin): ${data}`);
//     });
// });
//# sourceMappingURL=server.js.map