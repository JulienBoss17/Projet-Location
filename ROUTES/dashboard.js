const express = require("express");
const router = express.Router();
const verifySession = require('../MIDDLEWARES/verifysession.js');

const dashboardController = require("../CONTROLLERS/dashboard.js");
const depotDossierController = require("../CONTROLLERS/depotDossier.js");

// dashboard admin

router.get("/dashboardadmin", verifySession("admin"), dashboardController.dashAdmin)

// dashboard locataire
router.get("/dashboardlocataire", verifySession("locataire"), dashboardController.dashLocataire)

router.post('/casses/:userId', verifySession("locataire") ,dashboardController.casses);

router.post('/annonces/:userId', verifySession("admin") ,dashboardController.annonces);

router.get("/deleteallcasse", verifySession("admin"), dashboardController.deleteAllCasse)

router.get("/files/:fileId", depotDossierController.readPdf)

router.get("/updatechambres/:id", verifySession("admin"),dashboardController.updateChambresPage)
router.put("/editchambre/:id", verifySession("admin"),dashboardController.updateChambre)

module.exports = router;