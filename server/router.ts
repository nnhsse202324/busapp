import express, {Request, Response} from "express";
import {OAuth2Client, TokenPayload} from "google-auth-library";
import {readData, readWhitelist, readBusList} from "./ymlController";
import path from "path";
import fs from "fs";

export const router = express.Router();

const CLIENT_ID = "319647294384-m93pfm59lb2i07t532t09ed5165let11.apps.googleusercontent.com"
const oAuth2 = new OAuth2Client(CLIENT_ID);

// Homepage. This is where students will view bus information from. 
router.get("/", (req: Request, res: Response) => {
    // Reads from data file and displays data
    res.render("index", {
        data: readData(),
        render: fs.readFileSync(path.resolve(__dirname, "../views/include/indexContent.ejs")), 
    });
});


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
router.get("/admin", (req: Request, res: Response) => {
    // If user is not authenticated (email is not is session) redirects to login page
    if (!req.session.userEmail) {
        res.redirect("/login");
        return;
    }
    
    // Authorizes user, then either displays admin page or unauthorized page
    authorize(req);
    if (req.session.isAdmin) {
        res.render("admin", {
            data: readData(),
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

/* Admin page. This is where bus information can be updated from
Reads from data file and displays data */
router.get("/admin/updateBusList", (req: Request, res: Response) => {
    // If user is not authenticated (email is not is session) redirects to login page
    if (!req.session.userEmail) {
        res.redirect("/login");
        return;
    }
    
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