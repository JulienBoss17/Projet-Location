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
const flash = require('connect-flash');
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");

// app.set
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(session({
    secret: process.env.SECRETSESSION,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 1
    }
  }));
app.use(flash());

app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success");
    res.locals.error_msg = req.flash("error");
    res.locals.error_msg2 = req.flash("error2");
    res.locals.success_msg2 = req.flash("success2");
    next();
  });


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