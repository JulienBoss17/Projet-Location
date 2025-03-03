const User = require("../MODELS/Users.js");
const session = require('express-session');
const e = require("express");
const verifySession = require('../MIDDLEWARES/verifysession.js');
const UserFile = require('../MODELS/Userfiles');
const {upload} = require('../DATABASE/upload');
const { gfs } = require('../DATABASE/upload.js');
const mongoose = require("mongoose")


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

        try {
            const gridfsBucket = await getGridFsBucket();

            // Sauvegarde des fichiers dans GridFS et récupération de leurs IDs
            const filesData = await Promise.all(req.files.map(async (file) => {
                return new Promise((resolve, reject) => {
                    const uploadStream = gridfsBucket.openUploadStream(file.originalname, {
                        contentType: file.mimetype
                    });

                    uploadStream.end(file.buffer);

                    uploadStream.on('finish', () => {
                        resolve({
                            fileId: uploadStream.id,  // ✅ Utilisation correcte de l'ID
                            filename: file.filename,
                            originalname: file.originalname,
                            contentType: file.mimetype
                        });
                    });

                    uploadStream.on('error', (error) => {
                        console.error("❌ Erreur lors de l'upload GridFS:", error);
                        reject(error);
                    });
                });
            }));

            // Enregistrement des fichiers liés à l'utilisateur
            const userFiles = new UserFile({
                userId,
                files: filesData
            });

            await userFiles.save();
            req.flash("success", "Votre dossier a été déposé avec succès");
            res.redirect("/compte");

        } catch (saveError) {
            req.flash("error", "Vous avez déjà déposé votre dossier");
            res.redirect("/compte");
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

const { getGridFsBucket } = require('../DATABASE/upload');

exports.readPdf = async (req, res) => {
    const { fileId } = req.params;

    try {
        const gridfsBucket = await getGridFsBucket();

        if (!gridfsBucket) {
            console.error("❌ GridFSBucket non initialisé.");
            return res.status(500).json({ error: 'Erreur serveur: GridFS non initialisé' });
        }

        if (!mongoose.Types.ObjectId.isValid(fileId)) {
            console.error("❌ L'ID fourni n'est pas valide:", fileId);
            return res.status(400).json({ error: 'ID de fichier invalide' });
        }

        const objectId = new mongoose.Types.ObjectId(fileId);

        // ✅ Vérification dans `uploads.files` (et non `UserFile`)
        const fileExists = await gridfsBucket.find({ _id: objectId }).toArray();
        if (fileExists.length === 0) {
            console.error("❌ Aucun fichier trouvé dans `uploads.files` pour l'ID :", fileId);
            return res.status(404).json({ error: 'Fichier non trouvé' });
        }

        // ✅ Lecture correcte du fichier
        const readStream = gridfsBucket.openDownloadStream(objectId);

        res.setHeader('Content-Type', fileExists[0].contentType);
        res.setHeader('Content-Disposition', `inline; filename="${fileExists[0].filename}"`);

        readStream.pipe(res);

        readStream.on('error', (err) => {
            console.error('❌ Erreur de lecture:', err);
            res.status(500).json({ error: 'Erreur de lecture du fichier' });
        });

    } catch (error) {
        console.error('❌ Erreur lors de la récupération du fichier:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};


exports.listFiles = async (req, res) => {
    try {
        const gridfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
            bucketName: 'uploads'
        });

        const files = await gridfsBucket.find().toArray();
        res.json(files);
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des fichiers :", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};



