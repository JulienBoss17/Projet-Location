const User = require("../MODELS/Users.js");
const session = require('express-session');
const e = require("express");

exports.dashAdmin = async (req, res) => {
    console.log("dashAdmin")
    res.render("pages/dashboardAdmin");
};

exports.dashLocataire = async (req, res) => {
    console.log("dashLocataire")
    res.render("pages/dashboardLocataire");
};