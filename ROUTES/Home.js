const express = require("express");
const Chambres = require("../MODELS/Chambres.js");
const router = express.Router();
const verifySession = require('../MIDDLEWARES/verifysession.js');
const verifySession2 = require('../MIDDLEWARES/verifysession2.js');     
const verifySession3 = require('../MIDDLEWARES/verifySession3.js');


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
router.post("/logout", verifySession3(),homeController.logoutUsers)

// montrer un user par id
router.get("/showuser/:id", verifySession3(),homeController.showUsers)

// // retirer un user par id
router.get("/deleteuser/:id", verifySession3(),homeController.deleteUsersPage)
router.delete("/deleteuser/:id", verifySession3(),homeController.deleteUsers)

// // update un user par id
router.get("/edituser/:id", verifySession3(),homeController.updateUsersPage)
router.put("/edituser/:id", verifySession3(),homeController.updateUsers)

// voir une chambre par id
router.get("/show/:id", homeController.showChambres)

module.exports = router;