const express = require("express");
const router = express.Router();
const verifySession = require('../MIDDLEWARES/verifysession.js');
const verifySession2 = require('../MIDDLEWARES/verifysession2.js');
const verifySession3 = require('../MIDDLEWARES/verifySession3.js');
const { upload, gfs } = require('../DATABASE/upload'); 

const depotDossierController = require("../CONTROLLERS/depotDossier.js");

router.get("/depotdossier", verifySession(), depotDossierController.depotDossier);

router.post('/upload', verifySession3(), depotDossierController.uploadFile);

router.get('/mes-fichiers/:userId', verifySession2() ,depotDossierController.mesfichiers);

router.get("/files/:fileId", verifySession2() ,depotDossierController.readPdf)

router.get('/files', verifySession2(),depotDossierController.listFiles);

router.post("/admin/upload/:userId", verifySession2(), depotDossierController.adminUploadFile);

router.post("/admin/delete/:fileId", verifySession("admin"), depotDossierController.adminDeleteFile);


module.exports = router;
