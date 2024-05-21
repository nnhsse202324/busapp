import express, {Application, Request, Response} from "express";
import {router} from "./server/router";
import path from "path";
import fs from "fs";
import bodyParser from "body-parser";
import {createServer} from "http";
import {Server} from "socket.io";
import {readData, writeBuses, BusData, readBusList, writeWhitelist} from "./server/jsonHandler";
import {startWeather} from "./server/weatherController";
import session from "express-session";
const dotenv = require("dotenv");
const connectDB = require("./server/database/connection");
const Bus = require("./server/model/bus");
const Wave = require("./server/model/wave");

const app: Application = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

dotenv.config({ path: ".env" });
connectDB();

const PORT = process.env.PORT || 5182;

type BusCommand = {
    type: string
    data: BusData
}

const busesDatafile = path.resolve(__dirname, "./data/buses.json");
const defaultBusesDatafile = path.resolve(__dirname, "./data/defaultBuses.txt");
let buses: BusData[];

//root socket
io.of("/").on("connection", (socket) => {
    //console.log(`new connection on root (id:${socket.id})`);
    socket.on("debug", (data) => {
        console.log(`debug(root): ${data}`);
    });
});

//admin socket
io.of("/admin").on("connection", async (socket) => {
    socket.on("updateMain", async (command: BusCommand) => {


        let data = {
            allBuses: (await readData()).buses,
            nextWave: await Bus.find({status: "Next Wave"}),
            loading: await Bus.find({status: "Loading"}),
            isLocked: false, 
            leavingAt: new Date()
        };
        data.isLocked = (await Wave.findOne({})).locked;
        data.leavingAt = (await Wave.findOne({})).leavingAt;
        
        console.log("updateMain called")

        let indexData = {
            buses: await readData(),
            isLocked: data.isLocked,
            leavingAt: data.leavingAt
        }
        
        io.of("/admin").emit("update", data);
        io.of("/").emit("update", indexData);        
    });
    socket.on("debug", (data) => {
        console.log(`debug(admin): ${data}`);
    });
});

app.set("view engine", "ejs"); // Allows res.render() to render ejs
app.use(session({
    secret: "KQdqLPDjaGUWPXFKZrEGYYANxsxPvFMwGYpAtLjCCcN",
    resave: true,
    saveUninitialized: true
})); // Allows use of req.session
app.use(express.json());

app.use("/", router); // Imports routes from server/router.ts

app.use("/css", express.static(path.resolve(__dirname, "static/css")));
app.use("/js", express.static(path.resolve(__dirname, "static/ts")));
app.use("/img", express.static(path.resolve(__dirname, "static/img")));
app.use('/html', express.static(path.resolve(__dirname, "static/html")));

startWeather(io);



httpServer.listen(PORT, () => {console.log(`Server is running on port ${PORT}`)});
