const express = require("express");
const router = express.Router();
const verifySession = require('../MIDDLEWARES/verifysession.js');

const dashboardController = require("../CONTROLLERS/dashboard.js");

// dashboard admin

router.get("/dashboardadmin", verifySession("admin"), dashboardController.dashAdmin)

// dashboard locataire
router.get("/dashboardlocataire", verifySession("locataire"), dashboardController.dashLocataire)

module.exports = router;