const User = require("../MODELS/Users.js");
const session = require('express-session');
const e = require("express");
const verifySession = require('../MIDDLEWARES/verifysession.js');
const UserFile = require('../MODELS/Userfiles');
const upload = require('../DATABASE/upload');


exports.depotDossier = async (req, res) => {
        res.render("PAGES/depotDossier");
  }
  
  exports.uploadFile = async (req, res) => {
    upload.array('files', 6)(req, res, async (err) => {
        if (err) {
            console.error('❌ Erreur Multer:', err);
            return res.status(500).json({ error: 'Erreur lors de l’upload des fichiers' });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'Aucun fichier téléchargé' });
        }

        const userId = req.body.userId;
        if (!userId) {
            return res.status(400).json({ error: 'Utilisateur non spécifié' });
        }

        const userFiles = new UserFile({
            userId: userId,
            files: req.files.map(file => ({
                filename: file.filename,
                originalname: file.originalname,
                contentType: file.mimetype
            }))
        });

        try {
            await userFiles.save();
            res.redirect("/compte");
        } catch (saveError) {
            console.error('❌ Erreur lors de la sauvegarde des fichiers:', saveError);
            res.status(500).json({ error: 'Erreur lors de l’enregistrement des fichiers' });
        }
    });
};



exports.mesfichiers = async (req, res) => {
    try {
        const userId = req.params.userId;

        const userFiles = await UserFile.find({ userId });

        if (!userFiles || userFiles.length === 0) {
            return res.render('pages/candidature', { files: [], message: "Aucun fichier trouvé." });
        }

        let allFiles = [];
        userFiles.forEach(doc => {
            if (doc.files && doc.files.length > 0) {
                allFiles = allFiles.concat(doc.files);
            }
        });

        res.render('pages/candidature', { files: allFiles, message: null });

    } catch (error) {
        console.error(error);
        res.status(500).send("Erreur serveur");
    }
};

