// packages
const express = require("express")
const cookieParser = require('cookie-parser')
const app = express()
const ejs = require("ejs")
const dotenv = require("dotenv").config();
const bodyParser = require("body-parser")
const bcrypt = require("bcrypt");
const methodOverride = require("method-override");
const session = require('express-session');
const cors = require('cors');
const crypto = require('crypto');
const { GridFsStorage } = require('multer-gridfs-storage');
const flash = require('connect-flash');

// app.set
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(session({
    secret: process.env.SECRETSESSION, 
    resave: false,  
    saveUninitialized: false,  
    cookie: { 
        // maxAge: 1*60*1000,  
        secure: false  
    },
}));
app.use(flash());


// app.use
app.use(cookieParser());
app.use(express.static('public'));
app.use(function (req, res, next) {
    res.locals.user = req.session.user;
    next();
});
app.use(express.urlencoded({ extended: true })); 
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static("styles")); 
app.use(cors());

// routes
const homeRouter = require("../ROUTES/Home.js");
const depotDossierRouter = require("../ROUTES/depotDossier.js");
const dashboardRouter = require("../ROUTES/dashboard.js");

app.use(dashboardRouter);
app.use(homeRouter);
app.use(depotDossierRouter);

// variables
const port= process.env.PORT || 3020

app.listen(port,() => {
    console.log("listening http://localhost:"+ port)
})