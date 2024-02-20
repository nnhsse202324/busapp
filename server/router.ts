import express, {Request, Response} from "express";
import {OAuth2Client, TokenPayload} from "google-auth-library";
import { readData, readWhitelist, readBusList, writeBusList, readWeather, readBusStatus } from './jsonHandler';
import path from "path";
import fs, {readFileSync} from "fs";
import {resetDatafile} from "../server";
export const router = express.Router();

const Announcement = require("./model/announcement");
const Bus = require("./model/bus");
const Weather = require("./model/weather");
const Wave = require("./model/wave");

const CLIENT_ID = "319647294384-m93pfm59lb2i07t532t09ed5165let11.apps.googleusercontent.com"
const oAuth2 = new OAuth2Client(CLIENT_ID);

const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));

let announcement = "";

Announcement.findOneAndUpdate({}, {announcement: ""}, {upsert: true});

async function getBuses() {
    // get all the buses and create a list of objects like the following {number:,change:,time:,status:}
    const buses: any[] = await Bus.find({});
    const busList: any[] = [];
    buses.forEach((bus: any) => {
        busList.push({number: bus.busNumber, change: bus.busChange, time: bus.time, status: bus.status});
    });
    // if change is 0, make it an empty string
    busList.forEach((bus: any) => {
        if (bus.change === 0) bus.change = "";
        if(bus.time == undefined) bus.time = new Date();
        if (bus.status === "normal") bus.status = "";
        bus.time = bus.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        if(bus.status === "") bus.time = "";
    });

    // sort the list by bus number
    busList.sort((a: any, b: any) => {
        return a.number - b.number;
    });

    return busList;
}

// Homepage. This is where students will view bus information from. 
router.get("/", async (req: Request, res: Response) => {
    // Reads from data file and displays data
    let data = {buses: await getBuses(), weather: await Weather.findOne({})};

    res.render("index", {
        data: data,
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
        data: readData(),
        render: fs.readFileSync(path.resolve(__dirname, "../views/include/tvIndexContent.ejs")),                                
        announcement: (await Announcement.findOne({})).announcement
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

    let data = {
        allBuses: await getBuses(),
        nextWave: await Bus.find({status: "Next Wave"}),
        loading: await Bus.find({status: "Loading"}),
        isLocked: false
    };
    data.isLocked = (await Wave.findOne({})).locked;
    authorize(req);
    if (true) {
        res.render("admin", {
            data: data,
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

router.get("/waveStatus", async (req: Request, res: Response) => {
    // get the wave status from the wave schema
    const wave = await Wave.findOne({});
    res.send(wave.locked);
});

router.post("/updateBusChange", async (req: Request, res: Response) => {
    let busNumber = req.body.number;
    let busChange = req.body.change;
    let time = req.body.time;
    await Bus.findOneAndUpdate({busNumber: busNumber}, {busChange: busChange, time: time});
});

router.post("/updateBusStatus", async (req: Request, res: Response) => {
    let busNumber = req.body.number;
    let busStatus = req.body.status;
    let time = req.body.time;
    await Bus.findOneAndUpdate({busNumber: busNumber}, {status: busStatus, time: time});
});


router.post("/sendWave", async (req: Request, res: Response) => {

    await Bus.updateMany({ status: "Loading" }, { $set: { status: "Gone" } });
    await Bus.updateMany({ status: "Next Wave" }, { $set: { status: "Loading" } });
    await Wave.findOneAndUpdate({}, { locked: false }, { upsert: true });

});

router.post("/lockWave", async (req: Request, res: Response) => {

    await Wave.findOneAndUpdate({}, { locked: !(await Wave.findOne({})).locked }, { upsert: true });

});

router.post("/resetAllBusses", async (req: Request, res: Response) => {

    await Bus.updateMany({}, { $set: { status: "" } }); 

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
router.get("/updateBusList", async (req: Request, res: Response) => {
    // If user is not authenticated (email is not is session) redirects to login page
    if (!req.session.userEmail) {
        res.redirect("/login");
        return;
    }

    // Authorizes user, then either displays admin page or unauthorized page

    // get all the bus numbers of all the buses from the database and make a list of them
    const busList: string[] = await Bus.find().distinct("busNumber");

    let data = { busList: busList };

    authorize(req);
    if (req.session.isAdmin) {
        res.render("updateBusList",
        {
            data: data
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
            currentAnnouncement: (await Announcement.findOne({})).announcement
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

router.post("/updateBusList", async (req: Request, res: Response) => {
    // fs.writeFileSync(path.resolve(__dirname, "../data/busList.json"), JSON.stringify(req.body.busList));
    // if (req.body.reset) resetDatafile();

    // use the posted bus list to update the database, removing any buses that are not in the list, and adding any buses that are in the list but not in the database
    const busList: string[] = req.body.busList;
    Bus.find({})
        .then((buses: any[]) => {
            buses.forEach((bus: any) => { // for each bus in the database
                if (!busList.includes(bus.busNumber)) { // if the bus is not in the list
                    Bus.findOneAndDelete({ busNumber: bus.busNumber }).exec(); // remove the bus from the database
                }
            });
            busList.forEach(async (busNumber: string) => { // for each bus in the list
                if (!buses.map( (bus: any) => bus.busNumber).includes(busNumber)) { // if the bus is not in the database
                    try {
                        const newBus = new Bus({ // add the bus to the database
                            busNumber: busNumber,
                            busChange: 0,
                            status: "normal",
                            time: new Date(),
                        });
                        await newBus.save();
                    } catch (error) {
                        console.log("bus creation failed");
                    }
                }
            });
        })
});

router.get('/help',(req: Request, res: Response)=>{
res.render('help');
})
router.post("/whitelistFile",(req:Request,res: Response) => {
    fs.writeFileSync(path.resolve(__dirname, "../data/whitelist.json"), JSON.stringify(req.body.admins));
});

router.post("/submitAnnouncement", async (req: Request, res: Response) => {
    announcement = req.body.announcement;
    //overwrites the announcement in the database
    await Announcement.findOneAndUpdate({}, {announcement: announcement}, {upsert: true});
    res.redirect("/admin");
});

router.post("/clearAnnouncement", async (req: Request, res: Response) => {
    await Announcement.findOneAndUpdate({}, {announcement: ""}, {upsert: true});
    res.redirect("/admin");
});

