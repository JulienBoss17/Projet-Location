const express = require("express");
const router = express.Router();
const verifySession = require('../MIDDLEWARES/verifysession.js');
const verifySession3 = require('../MIDDLEWARES/verifySession3.js');
const verifySession2 = require('../MIDDLEWARES/verifysession2.js');

const dashboardController = require("../CONTROLLERS/dashboard.js");
const depotDossierController = require("../CONTROLLERS/depotDossier.js");

// dashboard admin

router.get("/dashboardadmin", verifySession2(), dashboardController.dashAdmin)

// dashboard locataire
router.get("/dashboardlocataire", verifySession2(), dashboardController.dashLocataire)

router.post('/casses/:userId', verifySession2() ,dashboardController.casses);

router.post('/annonces/:userId', verifySession2() ,dashboardController.annonces);

router.get("/deletecasse/:id", verifySession2(), dashboardController.deleteCasse)

router.get("/files/:fileId", verifySession3(),depotDossierController.readPdf)

router.get("/updatechambres/:id", verifySession2(),dashboardController.updateChambresPage)
router.put("/editchambre/:id", verifySession2(),dashboardController.updateChambre)

router.post("/delete-files", verifySession2(),dashboardController.deleteFiles);

router.post("/valider-locataire/:userId", dashboardController.assignChambreToLocataire);

module.exports = router;