"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const google_auth_library_1 = require("google-auth-library");
const jsonHandler_1 = require("./jsonHandler");
const path_1 = __importDefault(require("path"));
const fs_1 = __importStar(require("fs"));
exports.router = express_1.default.Router();
const Announcement = require("./model/announcement");
const Bus = require("./model/bus");
const Weather = require("./model/weather");
const Wave = require("./model/wave");
const CLIENT_ID = "319647294384-m93pfm59lb2i07t532t09ed5165let11.apps.googleusercontent.com";
const oAuth2 = new google_auth_library_1.OAuth2Client(CLIENT_ID);
const bodyParser = require('body-parser');
exports.router.use(bodyParser.urlencoded({ extended: true }));
Announcement.findOneAndUpdate({}, { announcement: "" }, { upsert: true });
Announcement.findOneAndUpdate({}, { tvAnnouncement: "" }, { upsert: true });
let timer = 3;
function getBuses() {
    return __awaiter(this, void 0, void 0, function* () {
        // get all the buses and create a list of objects like the following {number:,change:,time:,status:}
        const buses = yield Bus.find({});
        const busList = [];
        buses.forEach((bus) => {
            busList.push({ number: bus.busNumber, change: bus.busChange, time: bus.time, status: bus.status });
        });
        // if change is 0, make it an empty string
        busList.forEach((bus) => {
            if (bus.change === 0)
                bus.change = "";
            if (bus.time == undefined)
                bus.time = new Date();
            if (bus.status === "normal")
                bus.status = "";
            bus.time = bus.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
            if (bus.status === "")
                bus.time = "";
        });
        // sort the list by bus number
        busList.sort((a, b) => {
            return a.number - b.number;
        });
        return busList;
    });
}
// Homepage. This is where students will view bus information from. 
exports.router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Reads from data file and displays data
    let data = {
        buses: yield getBuses(), weather: yield Weather.findOne({}),
        isLocked: false,
        leavingAt: new Date()
    };
    data.isLocked = (yield Wave.findOne({})).locked;
    data.leavingAt = (yield Wave.findOne({})).leavingAt;
    res.render("index", {
        data: data,
        render: fs_1.default.readFileSync(path_1.default.resolve(__dirname, "../views/include/indexContent.ejs")),
        announcement: (yield Announcement.findOne({})).announcement
    });
}));
// not pages, but requests for the data
exports.router.get('/buses', (req, res) => {
    res.send((0, jsonHandler_1.readBusStatus)());
});
exports.router.get('/weather', (req, res) => {
    res.send((0, jsonHandler_1.readWeather)());
});
// tv route
exports.router.get("/tv", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Reads from data file and displays data
    res.render("tv", {
        data: (0, jsonHandler_1.readData)(),
        render: fs_1.default.readFileSync(path_1.default.resolve(__dirname, "../views/include/tvIndexContent.ejs")),
        announcement: (yield Announcement.findOne({})).tvAnnouncement
    });
}));
// Login page. User authenticates here and then is redirected to admin (where they will be authorized)
exports.router.get("/login", (req, res) => {
    res.render("login");
});
// Authenticates the user
exports.router.post("/auth/v1/google", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let token = req.body.token; // Gets token from request body
    let ticket = yield oAuth2.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID
    });
    req.session.userEmail = ticket.getPayload().email; // Store email in session
    res.status(201).end();
}));
// Checks if the user's email is in the whitelist and authorizes accordingly
function authorize(req) {
    req.session.isAdmin = (0, jsonHandler_1.readWhitelist)().admins.includes(req.session.userEmail);
}
/* Admin page. This is where bus information can be updated from
Reads from data file and displays data */
exports.router.get("/admin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // If user is not authenticated (email is not is session) redirects to login page
    if (!req.session.userEmail) {
        res.redirect("/login");
        return;
    }
    // Authorizes user, then either displays admin page or unauthorized page
    let data = {
        allBuses: yield getBuses(),
        nextWave: yield Bus.find({ status: "Next Wave" }),
        loading: yield Bus.find({ status: "Loading" }),
        isLocked: false,
        leavingAt: new Date()
    };
    data.isLocked = (yield Wave.findOne({})).locked;
    data.leavingAt = (yield Wave.findOne({})).leavingAt;
    authorize(req);
    if (true) {
        res.render("admin", {
            data: data,
            render: fs_1.default.readFileSync(path_1.default.resolve(__dirname, "../views/include/adminContent.ejs")),
            emptyRow: fs_1.default.readFileSync(path_1.default.resolve(__dirname, "../views/sockets/adminEmptyRow.ejs")),
            populatedRow: fs_1.default.readFileSync(path_1.default.resolve(__dirname, "../views/sockets/adminPopulatedRow.ejs")),
            weather: fs_1.default.readFileSync(path_1.default.resolve(__dirname, "../views/sockets/weather.ejs"))
        });
    }
    else {
        res.render("unauthorized");
    }
}));
exports.router.get("/waveStatus", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // get the wave status from the wave schema
    const wave = yield Wave.findOne({});
    res.send(wave.locked);
}));
exports.router.post("/updateBusChange", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let busNumber = req.body.number;
    let busChange = req.body.change;
    let time = req.body.time;
    yield Bus.findOneAndUpdate({ busNumber: busNumber }, { busChange: busChange, time: time });
}));
exports.router.post("/updateBusStatus", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let busNumber = req.body.number;
    let busStatus = req.body.status;
    let time = req.body.time;
    yield Bus.findOneAndUpdate({ busNumber: busNumber }, { status: busStatus, time: time });
}));
exports.router.post("/sendWave", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield Bus.updateMany({ status: "Loading" }, { $set: { status: "Gone" } });
    yield Bus.updateMany({ status: "Next Wave" }, { $set: { status: "Loading" } });
    yield Wave.findOneAndUpdate({}, { locked: false }, { upsert: true });
}));
exports.router.post("/lockWave", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield Wave.findOneAndUpdate({}, { locked: !(yield Wave.findOne({})).locked }, { upsert: true });
    const leavingAt = new Date();
    leavingAt.setMinutes(leavingAt.getMinutes() + timer);
    yield Wave.findOneAndUpdate({}, { leavingAt: leavingAt }, { upsert: true });
}));
exports.router.post("/setTimer", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    timer = Number(req.body.minutes);
}));
exports.router.get("/leavingAt", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const leavingAt = (yield Wave.findOne({})).leavingAt;
    res.send(leavingAt);
}));
exports.router.post("/resetAllBusses", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield Bus.updateMany({}, { $set: { status: "" } });
}));
exports.router.get("/beans", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.sendFile(path_1.default.resolve(__dirname, "../static/img/beans.jpg"));
}));
exports.router.get("/manifest.webmanifest", (req, res) => {
    res.sendFile(path_1.default.resolve(__dirname, "../data/manifest.webmanifest"));
});
exports.router.get("/sw.js", (req, res) => {
    res.sendFile(path_1.default.resolve(__dirname, "../sw.js"));
});
/* Admin page. This is where bus information can be updated from
Reads from data file and displays data */
exports.router.get("/updateBusList", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // If user is not authenticated (email is not is session) redirects to login page
    if (!req.session.userEmail) {
        res.redirect("/login");
        return;
    }
    // Authorizes user, then either displays admin page or unauthorized page
    // get all the bus numbers of all the buses from the database and make a list of them
    const busList = yield Bus.find().distinct("busNumber");
    let data = { busList: busList };
    authorize(req);
    if (req.session.isAdmin) {
        res.render("updateBusList", {
            data: data
        });
    }
    else {
        res.render("unauthorized");
    }
}));
exports.router.get("/makeAnnouncement", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // If user is not authenticated (email is not is session) redirects to login page
    if (!req.session.userEmail) {
        res.redirect("/login");
        return;
    }
    +
    // Authorizes user, then either displays admin page or unauthorized page
    authorize(req);
    if (req.session.isAdmin) {
        res.render("makeAnnouncement", {
            currentAnnouncement: (yield Announcement.findOne({})).announcement,
            currentTvAnnouncement: (yield Announcement.findOne({})).tvAnnouncement
        });
    }
    else {
        res.render("unauthorized");
    }
}));
exports.router.get('/whitelist', (req, res) => {
    // If user is not authenticated (email is not is session) redirects to login page
    if (!req.session.userEmail) {
        res.redirect("/login");
        return;
    }
    // Authorizes user, then either displays admin page or unauthorized page
    authorize(req);
    if (req.session.isAdmin) {
        res.render("updateWhitelist", {
            whitelist: (0, jsonHandler_1.readWhitelist)()
        });
    }
    else {
        res.render("unauthorized");
    }
});
exports.router.get('/updateWhitelist', (req, res) => {
    // If user is not authenticated (email is not is session) redirects to login page
    if (!req.session.userEmail) {
        res.redirect("/login");
        return;
    }
    // Authorizes user, then either displays admin page or unauthorized page
    authorize(req);
    if (req.session.isAdmin) {
        res.render("updateWhitelist");
    }
    else {
        res.render("unauthorized");
    }
});
exports.router.get("/updateBusListEmptyRow", (req, res) => {
    res.sendFile(path_1.default.resolve(__dirname, "../views/sockets/updateBusListEmptyRow.ejs"));
});
exports.router.get("/updateBusListPopulatedRow", (req, res) => {
    res.sendFile(path_1.default.resolve(__dirname, "../views/sockets/updateBusListPopulatedRow.ejs"));
});
exports.router.get("/adminEmptyRow", (req, res) => {
    res.sendFile(path_1.default.resolve(__dirname, "../views/sockets/adminEmptyRow.ejs"));
});
exports.router.get("/busList", (req, res) => {
    res.type("json").send((0, fs_1.readFileSync)(path_1.default.resolve(__dirname, "../data/busList.json")));
});
exports.router.get("/whitelistFile", (req, res) => {
    res.type("json").send((0, fs_1.readFileSync)(path_1.default.resolve(__dirname, "../data/whitelist.json")));
});
exports.router.post("/updateBusList", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // fs.writeFileSync(path.resolve(__dirname, "../data/busList.json"), JSON.stringify(req.body.busList));
    // if (req.body.reset) resetDatafile();
    // use the posted bus list to update the database, removing any buses that are not in the list, and adding any buses that are in the list but not in the database
    const busList = req.body.busList;
    Bus.find({})
        .then((buses) => {
        buses.forEach((bus) => {
            if (!busList.includes(bus.busNumber)) { // if the bus is not in the list
                Bus.findOneAndDelete({ busNumber: bus.busNumber }).exec(); // remove the bus from the database
            }
        });
        busList.forEach((busNumber) => __awaiter(void 0, void 0, void 0, function* () {
            if (!buses.map((bus) => bus.busNumber).includes(busNumber)) { // if the bus is not in the database
                try {
                    const newBus = new Bus({
                        busNumber: busNumber,
                        busChange: 0,
                        status: "normal",
                        time: new Date(),
                    });
                    yield newBus.save();
                }
                catch (error) {
                    console.log("bus creation failed");
                }
            }
        }));
    });
}));
exports.router.get('/help', (req, res) => {
    res.render('help');
});
exports.router.post("/whitelistFile", (req, res) => {
    fs_1.default.writeFileSync(path_1.default.resolve(__dirname, "../data/whitelist.json"), JSON.stringify(req.body.admins));
});
exports.router.post("/submitAnnouncement", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield Announcement.findOneAndUpdate({}, { announcement: req.body.announcement, tvAnnouncement: req.body.tvAnnouncement }, { upsert: true });
    res.redirect("/admin");
}));
exports.router.post("/clearAnnouncement", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield Announcement.findOneAndUpdate({}, { announcement: "" }, { upsert: true });
}));
//# sourceMappingURL=router.js.map