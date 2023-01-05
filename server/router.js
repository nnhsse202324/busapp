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
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const google_auth_library_1 = require("google-auth-library");
const ymlController_1 = require("./ymlController");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
exports.router = express_1.default.Router();
const CLIENT_ID = "319647294384-m93pfm59lb2i07t532t09ed5165let11.apps.googleusercontent.com";
const oAuth2 = new google_auth_library_1.OAuth2Client(CLIENT_ID);
// Homepage. This is where students will view bus information from. 
exports.router.get("/", (req, res) => {
    // Reads from data file and displays data
    res.render("index", {
        data: (0, ymlController_1.readData)(),
        render: fs_1.default.readFileSync(path_1.default.resolve(__dirname, "../views/include/indexContent.ejs")),
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
    req.session.isAdmin = (0, ymlController_1.readWhitelist)().admins.includes(req.session.userEmail);
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
            data: (0, ymlController_1.readData)(),
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
/* Admin page. This is where bus information can be updated from
Reads from data file and displays data */
exports.router.get("/admin/updateBusList", (req, res) => {
    // If user is not authenticated (email is not is session) redirects to login page
    if (!req.session.userEmail) {
        res.redirect("/login");
        return;
    }
    // Authorizes user, then either displays admin page or unauthorized page
    authorize(req);
    if (req.session.isAdmin) {
        res.render("updateBusList", {
            data: (0, ymlController_1.readBusList)()
        });
    }
    else {
        res.render("unauthorized");
    }
});
//# sourceMappingURL=router.js.map