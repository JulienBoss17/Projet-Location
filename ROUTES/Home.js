const express = require("express");
const Chambres = require("../MODELS/Chambres.js");
const router = express.Router();
const verifySession = require('../MIDDLEWARES/verifysession.js');
const verifySession2 = require('../MIDDLEWARES/verifysession2.js');     
const verifySession3 = require('../MIDDLEWARES/verifySession3.js');
const homeController = require("../CONTROLLERS/Home.js");

router.get("/", homeController.home);

router.get("/compte", homeController.compte);

router.post("/register", homeController.newUsers)

router.post("/login", homeController.loginUsers)

router.post("/logout", verifySession3(),homeController.logoutUsers)

router.get("/showuser/:id", verifySession3(),homeController.showUsers)

router.get("/deleteuser/:id", verifySession3(),homeController.deleteUsersPage)
router.delete("/deleteuser/:id", verifySession3(),homeController.deleteUsers)

router.get("/edituser/:id", verifySession3(),homeController.updateUsersPage)
router.put("/edituser/:id", verifySession3(),homeController.updateUsers)

router.get("/show/:id", homeController.showChambres)

router.get("/presentation", homeController.presentation);

router.get("/localisation", homeController.localisation);

router.get("/contact", homeController.contact);

module.exports = router;