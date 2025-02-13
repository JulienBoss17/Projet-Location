const express = require("express");
const router = express.Router();
const verifySession = require('../MIDDLEWARES/verifysession.js');
const upload = require('../DATABASE/upload');

const depotDossierController = require("../CONTROLLERS/depotDossier.js");

// get dépot de dossier
router.get("/depotdossier", verifySession("un simple utilisateur") ,depotDossierController.depotDossier)

router.post('/upload', verifySession("un simple utilisateur") ,depotDossierController.uploadFile);

module.exports = router;