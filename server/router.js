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
const CLIENT_ID = "319647294384-m93pfm59lb2i07t532t09ed5165let11.apps.googleusercontent.com";
const oAuth2 = new google_auth_library_1.OAuth2Client(CLIENT_ID);
const bodyParser = require('body-parser');
exports.router.use(bodyParser.urlencoded({ extended: true }));
let announcement = "";
Announcement.findOneAndUpdate({}, { announcement: "" }, { upsert: true });
// Homepage. This is where students will view bus information from. 
exports.router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Reads from data file and displays data
    console.log((yield Announcement.findOne({})).announcement);
    res.render("index", {
        data: (0, jsonHandler_1.readData)(),
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
exports.router.get("/tv", (req, res) => {
    // Reads from data file and displays data
    res.render("tv", {
        data: (0, jsonHandler_1.readData)(),
        render: fs_1.default.readFileSync(path_1.default.resolve(__dirname, "../views/include/tvIndexContent.ejs")),
        announcement: announcement
    });
});
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
exports.router.get("/admin", (req, res) => {
    // If user is not authenticated (email is not is session) redirects to login page
    if (!req.session.userEmail) {
        res.redirect("/login");
        return;
    }
    // Authorizes user, then either displays admin page or unauthorized page
    authorize(req);
    if (req.session.isAdmin) {
        res.render("admin", {
            data: (0, jsonHandler_1.readData)(),
            render: fs_1.default.readFileSync(path_1.default.resolve(__dirname, "../views/include/adminContent.ejs")),
            emptyRow: fs_1.default.readFileSync(path_1.default.resolve(__dirname, "../views/sockets/adminEmptyRow.ejs")),
            populatedRow: fs_1.default.readFileSync(path_1.default.resolve(__dirname, "../views/sockets/adminPopulatedRow.ejs")),
            weather: fs_1.default.readFileSync(path_1.default.resolve(__dirname, "../views/sockets/weather.ejs"))
        });
    }
    else {
        res.render("unauthorized");
    }
});
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
exports.router.get("/updateBusList", (req, res) => {
    // If user is not authenticated (email is not is session) redirects to login page
    if (!req.session.userEmail) {
        res.redirect("/login");
        return;
    }
    +
    // Authorizes user, then either displays admin page or unauthorized page
    authorize(req);
    if (req.session.isAdmin) {
        res.render("updateBusList", {
            data: (0, jsonHandler_1.readBusList)()
        });
    }
    else {
        res.render("unauthorized");
    }
});
exports.router.get("/makeAnnouncement", (req, res) => {
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
            data: (0, jsonHandler_1.readBusList)()
        });
    }
    else {
        res.render("unauthorized");
    }
});
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
exports.router.post("/updateBusList", (req, res) => {
    // fs.writeFileSync(path.resolve(__dirname, "../data/busList.json"), JSON.stringify(req.body.busList));
    // console.log(req.body.busList);
    // if (req.body.reset) resetDatafile();
    const bussesOnMongo = Bus.find({});
    const bussesToPush = req.body.busList.filter((bus) => !bussesOnMongo.includes(bus));
    bussesToPush.forEach((bus) => {
        Bus.create(bus);
    });
    const bussesToDelete = bussesOnMongo.filter((bus) => !req.body.busList.includes(bus));
    bussesToDelete.forEach((bus) => {
        Bus.deleteOne(bus);
    });
    console.log(bussesToPush);
});
exports.router.get('/help', (req, res) => {
    res.render('help');
});
exports.router.post("/whitelistFile", (req, res) => {
    fs_1.default.writeFileSync(path_1.default.resolve(__dirname, "../data/whitelist.json"), JSON.stringify(req.body.admins));
});
exports.router.post("/submitAnnouncement", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    announcement = req.body.announcement;
    console.log(announcement);
    //overwrites the announcement in the database
    yield Announcement.findOneAndUpdate({}, { announcement: announcement }, { upsert: true });
    res.redirect("/admin");
}));
exports.router.post("/clearAnnouncement", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield Announcement.findOneAndUpdate({}, { announcement: "" }, { upsert: true });
    res.redirect("/admin");
}));
//# sourceMappingURL=router.js.map