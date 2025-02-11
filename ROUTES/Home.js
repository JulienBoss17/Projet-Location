const express = require("express");
const Chambres = require("../MODELS/Chambres.js");
const router = express.Router();
const verifyToken = require('../DATABASE/verifytoken.js');

const homeController = require("../CONTROLLERS/Home.js");

// Home
router.get("/", homeController.home);

// Compte
router.get("/compte", homeController.compte);

// Register
router.post("/register", homeController.newUsers)

// Login
router.post("/login", homeController.loginUsers)

// Logout
router.post("/logout", homeController.logoutUsers)

// montrer un user par id
router.get("/showuser/:id", homeController.showUsers)

// // retirer un user par id
router.get("/deleteuser/:id", homeController.deleteUsersPage)
router.delete("/deleteuser/:id", homeController.deleteUsers)

// // update un user par id
router.get("/edituser/:id", homeController.updateUsersPage)
router.put("/edituser/:id", homeController.updateUsers)

// voir une chambre par id
router.get("/show/:id", homeController.showChambres)

router.get("/dashboardadmin", verifyToken, homeController.dashAdmin)

router.get("/dashboardlocataire", verifyToken, homeController.dashLocataire)

module.exports = router;