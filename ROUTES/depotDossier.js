const express = require("express");
const router = express.Router();
const verifySession = require('../MIDDLEWARES/verifysession.js');
const { upload, gfs } = require('../DATABASE/upload'); // Importez gfs et upload depuis upload.js

const depotDossierController = require("../CONTROLLERS/depotDossier.js");

// get dépot de dossier
router.get("/depotdossier", verifySession("un simple utilisateur"), depotDossierController.depotDossier);

router.post('/upload', verifySession("un simple utilisateur"), depotDossierController.uploadFile);

router.get('/mes-fichiers/:userId', depotDossierController.mesfichiers);

module.exports = router;
