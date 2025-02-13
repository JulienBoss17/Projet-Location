const User = require("../MODELS/Users.js");
const session = require('express-session');
const e = require("express");
const verifySession = require('../MIDDLEWARES/verifysession.js');
const UserFile = require('../MODELS/Userfiles.js');
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

  
