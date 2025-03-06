const express = require("express");
const router = express.Router();
const verifySession = require('../MIDDLEWARES/verifysession.js');
const verifySession2 = require('../MIDDLEWARES/verifysession2.js');
const { upload, gfs } = require('../DATABASE/upload'); // Importez gfs et upload depuis upload.js

const depotDossierController = require("../CONTROLLERS/depotDossier.js");

// get dépot de dossier
router.get("/depotdossier", verifySession("un simple utilisateur"), depotDossierController.depotDossier);

router.post('/upload', verifySession("un simple utilisateur"), depotDossierController.uploadFile);

router.get('/mes-fichiers/:userId', verifySession2() ,depotDossierController.mesfichiers);

router.get("/files/:fileId" ,depotDossierController.readPdf)

router.get('/files', verifySession("admin"),depotDossierController.listFiles);


module.exports = router;
