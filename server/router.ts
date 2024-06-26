import express, {Request, Response} from "express";
import {OAuth2Client, TokenPayload} from "google-auth-library";
import { readData, readWhitelist, readBusList, writeBusList, readWeather, readBusStatus } from './jsonHandler';
import path from "path";
import fs, {readFileSync} from "fs";
import {resetDatafile} from "../server";
export const router = express.Router();
const Announcement = require("./model/announcement");

const CLIENT_ID = "319647294384-m93pfm59lb2i07t532t09ed5165let11.apps.googleusercontent.com"
const oAuth2 = new OAuth2Client(CLIENT_ID);

const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));

Announcement.findOneAndUpdate({}, {announcement: ""}, {upsert: true});
Announcement.findOneAndUpdate({}, {tvAnnouncement: ""}, {upsert: true});

// Homepage. This is where students will view bus information from. 
router.get("/", async (req: Request, res: Response) => {
    // Reads from data file and displays data
    res.render("index", {
        data: await readData(),
        render: fs.readFileSync(path.resolve(__dirname, "../views/include/indexContent.ejs")),
        announcement: (await Announcement.findOne({})).announcement
    });
});

// not pages, but requests for the data
router.get('/buses',(req, res)=>{
    res.send(readBusStatus());
})

router.get('/weather',(req, res)=>{
    res.send(readWeather());
})

// tv route
router.get("/tv", async (req: Request, res: Response) => {
    // Reads from data file and displays data
    res.render("tv", {
        data: await readData(),
        render: fs.readFileSync(path.resolve(__dirname, "../views/include/tvIndexContent.ejs")),                                
        announcement: (await Announcement.findOne({})).tvAnnouncement
    })
})

// Login page. User authenticates here and then is redirected to admin (where they will be authorized)
router.get("/login", (req: Request, res: Response) => {
    res.render("login");
});

// Authenticates the user
router.post("/auth/v1/google", async (req: Request, res: Response) => {
    let token = req.body.token; // Gets token from request body
    let ticket = await oAuth2.verifyIdToken({ // Verifies and decodes token    
        idToken: token,
        audience: CLIENT_ID
    });
    req.session.userEmail = ticket.getPayload()!.email!; // Store email in session
    res.status(201).end();
});

// Checks if the user's email is in the whitelist and authorizes accordingly
function authorize(req: Request) {
    req.session.isAdmin = readWhitelist().admins.includes(<string> req.session.userEmail); 
}

/* Admin page. This is where bus information can be updated from
Reads from data file and displays data */
router.get("/admin", async (req: Request, res: Response) => {
    // If user is not authenticated (email is not is session) redirects to login page
    if (!req.session.userEmail) {
        res.redirect("/login");
        return;
    }
    
    // Authorizes user, then either displays admin page or unauthorized page
    authorize(req);
    if (req.session.isAdmin) {
        res.render("admin", {
            data: await readData(),
            render: fs.readFileSync(path.resolve(__dirname, "../views/include/adminContent.ejs")),
            emptyRow: fs.readFileSync(path.resolve(__dirname, "../views/sockets/adminEmptyRow.ejs")),
            populatedRow: fs.readFileSync(path.resolve(__dirname, "../views/sockets/adminPopulatedRow.ejs")),
            weather: fs.readFileSync(path.resolve(__dirname, "../views/sockets/weather.ejs"))
        });
    }
    else {
        res.render("unauthorized");
    }
});

router.get("/beans", async (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, "../static/img/beans.jpg"));
});

router.get("/manifest.webmanifest", (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, "../data/manifest.webmanifest"))
});
router.get("/sw.js", (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, "../sw.js"))
});

/* Admin page. This is where bus information can be updated from
Reads from data file and displays data */
router.get("/updateBusList", (req: Request, res: Response) => {
    // If user is not authenticated (email is not is session) redirects to login page
    if (!req.session.userEmail) {
        res.redirect("/login");
        return;
    }+
    
    // Authorizes user, then either displays admin page or unauthorized page
    authorize(req);
    if (req.session.isAdmin) {
        res.render("updateBusList",
        {
            data: readBusList()
        });
    }
    else {
        res.render("unauthorized");
    }
});

router.get("/makeAnnouncement", async (req: Request, res: Response) => {
    // If user is not authenticated (email is not is session) redirects to login page
    if (!req.session.userEmail) {
        res.redirect("/login");
        return;
    }+
    
    // Authorizes user, then either displays admin page or unauthorized page
    authorize(req);
    if (req.session.isAdmin) {
        res.render("makeAnnouncement",
        {
            currentAnnouncement: (await Announcement.findOne({})).announcement,
            currentTvAnnouncement: (await Announcement.findOne({})).tvAnnouncement
        });
    }
    else {
        res.render("unauthorized");
    }
});

router.get('/whitelist', (req: Request,res: Response)=>{
    // If user is not authenticated (email is not is session) redirects to login page
    if (!req.session.userEmail) {
        res.redirect("/login");
        return;
    }
    
    // Authorizes user, then either displays admin page or unauthorized page
    authorize(req);
    if (req.session.isAdmin) {
        res.render("updateWhitelist", {
            whitelist: readWhitelist()
        });
    }
    else {
        res.render("unauthorized");
    }
})

router.get('/updateWhitelist', (req: Request,res: Response)=>{
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
})
router.get("/updateBusListEmptyRow", (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, "../views/sockets/updateBusListEmptyRow.ejs"));
});

router.get("/updateBusListPopulatedRow", (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, "../views/sockets/updateBusListPopulatedRow.ejs"));
});

router.get("/adminEmptyRow", (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, "../views/sockets/adminEmptyRow.ejs"));
});

router.get("/busList", (req: Request, res: Response) => {
    res.type("json").send(readFileSync(path.resolve(__dirname, "../data/busList.json")));
});

router.get("/whitelistFile", (req: Request, res: Response) => {
    res.type("json").send(readFileSync(path.resolve(__dirname, "../data/whitelist.json")));
});

router.post("/updateBusList", (req: Request, res: Response) => {
    fs.writeFileSync(path.resolve(__dirname, "../data/busList.json"), JSON.stringify(req.body.busList));
    if (req.body.reset) resetDatafile();
});

router.get('/help',(req: Request, res: Response)=>{
res.render('help');
})
router.post("/whitelistFile",(req:Request,res: Response) => {
    fs.writeFileSync(path.resolve(__dirname, "../data/whitelist.json"), JSON.stringify(req.body.admins));
});

router.post("/submitAnnouncement", async (req: Request, res: Response) => {    //overwrites the announcement in the database
    await Announcement.findOneAndUpdate({}, {announcement: req.body.announcement, tvAnnouncement: req.body.tvAnnouncement}, {upsert: true});
    res.redirect("/admin");
});


router.post("/clearAnnouncement", async (req: Request, res: Response) => {
    await Announcement.findOneAndUpdate({}, {announcement: ""}, {upsert: true});
});

