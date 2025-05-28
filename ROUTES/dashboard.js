const express = require("express");
const router = express.Router();
const verifySession = require('../MIDDLEWARES/verifysession.js');
const verifySession3 = require('../MIDDLEWARES/verifySession3.js');
const verifySession2 = require('../MIDDLEWARES/verifysession2.js');

const dashboardController = require("../CONTROLLERS/dashboard.js");
const depotDossierController = require("../CONTROLLERS/depotDossier.js");


router.get("/dashboardadmin", verifySession("admin"), dashboardController.dashAdmin)

router.get("/dashboardlocataire", verifySession("locataire"), dashboardController.dashLocataire)

router.post('/casses/:userId', verifySession2() ,dashboardController.casses);

router.post('/annonces/:userId', verifySession2() ,dashboardController.annonces);

router.get("/deletecasse/:id", verifySession2(), dashboardController.deleteCasse)

router.get("/files/:fileId", verifySession3(),depotDossierController.readPdf)

router.get("/updatechambres/:id", verifySession2(),dashboardController.updateChambresPage)
router.put("/editchambre/:id", verifySession2(),dashboardController.updateChambre)

router.post("/delete-files", verifySession2(),dashboardController.deleteFiles);

router.post("/admin/valider-locataire/:userId", verifySession2(),dashboardController.assignChambreToLocataire);

router.post("/admin/remove-locataire/:userId", verifySession2(),dashboardController.removeLocataire);




module.exports = router;