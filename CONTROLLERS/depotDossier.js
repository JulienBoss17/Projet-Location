const User = require("../MODELS/Users.js");
const session = require('express-session');
const e = require("express");
const verifySession = require('../MIDDLEWARES/verifysession.js');
const UserFile = require('../MODELS/Userfiles');
const {upload} = require('../DATABASE/upload');
const { gfs } = require('../DATABASE/upload.js');
const mongoose = require("mongoose")
const { getGridFsBucket } = require('../DATABASE/upload');
const Chambre = require("../MODELS/Chambres.js")



exports.depotDossier = async (req, res) => {
    const chambres = await Chambre.find();
        res.render("PAGES/depotDossier", {chambres});
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
            const existingFiles = await UserFile.findOne({ userId });

            if (existingFiles) {
                req.flash("error2", "Vous avez déjà déposé votre dossier.");
                return res.redirect("/compte");
            }
            const gridfsBucket = await getGridFsBucket();

            const filesData = await Promise.all(req.files.map(async (file) => {
                return new Promise((resolve, reject) => {
                    const uploadStream = gridfsBucket.openUploadStream(file.originalname, {
                        contentType: file.mimetype
                    });

                    uploadStream.end(file.buffer);

                    uploadStream.on('finish', () => {
                        resolve({
                            fileId: uploadStream.id, 
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

            const chambre = await Chambre.findById(req.body.chambre);

            const userFiles = new UserFile({
                userId,
                files: filesData,
                chambre
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
        const user1 = await User.findById(userId);
        const chambreUser = await Chambre.findById(user1.chambre);
        const userFiles = await UserFile.find({ userId });

        let allFiles = [];
        let allQuittances = [];

        userFiles.forEach(doc => {
            if (doc.files && doc.files.length > 0) {
                allFiles = allFiles.concat(doc.files);
            }
            if (doc.quittances && doc.quittances.length > 0) {
                allQuittances = allQuittances.concat(doc.quittances);
            }
        });

        allQuittances.sort((a, b) => {
            if (a.annee !== b.annee) return b.annee - a.annee;
            return b.mois - a.mois;
        });

        res.render('pages/candidature', { 
            userFiles,
            files: allFiles, 
            quittances: allQuittances, 
            message: null, 
            userId,
            user1,
            chambreUser
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Erreur serveur");
    }
};





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

        const fileExists = await gridfsBucket.find({ _id: objectId }).toArray();
        if (fileExists.length === 0) {
            console.error("❌ Aucun fichier trouvé dans `uploads.files` pour l'ID :", fileId);
            return res.status(404).json({ error: 'Fichier non trouvé' });
        }

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
            bucketName: 'userfiles'
        });

        const files = await gridfsBucket.find().toArray();
        res.json(files);
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des fichiers :", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

exports.adminUploadFile = async (req, res) => {
    upload.single('file')(req, res, async (err) => {
        if (err) {
            console.error('❌ Erreur Multer:', err);
            return res.status(500).json({ error: 'Erreur lors de l’upload du fichier' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'Aucun fichier téléchargé' });
        }

        try {
            const userId = req.params.userId;
            const { type, mois, annee } = req.body; 

            let userFiles = await UserFile.findOne({ userId });

            if (!userFiles) {
                userFiles = new UserFile({ userId, files: [], quittances: [] });
            }

            const gridfsBucket = await getGridFsBucket();

            const uploadStream = gridfsBucket.openUploadStream(req.file.originalname, {
                contentType: req.file.mimetype
            });

            uploadStream.end(req.file.buffer);

            uploadStream.on('finish', async () => {
                const fileData = {
                    fileId: uploadStream.id,
                    filename: req.file.filename,
                    originalname: req.file.originalname,
                    contentType: req.file.mimetype,
                    uploadDate: new Date()
                };

                if (type === 'quittance') {
                    if (!mois || !annee) {
                        return res.status(400).json({ error: 'Mois et année requis pour une quittance' });
                    }

                    userFiles.quittances.push({
                        ...fileData,
                        mois: parseInt(mois),
                        annee: parseInt(annee)
                    });
                } else {
                    userFiles.files.push(fileData);
                }

                await userFiles.save();

                res.redirect(`/mes-fichiers/${userId}`);
            });

            uploadStream.on('error', (error) => {
                console.error("❌ Erreur lors de l'upload GridFS:", error);
                res.redirect(`/mes-fichiers/${userId}`);
            });

        } catch (error) {
            console.error("❌ Erreur lors de l'upload:", error);
            res.redirect(`/mes-fichiers/${req.params.userId}`);
        }
    });
};


exports.adminDeleteFile = async (req, res) => {
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

        const userFile = await UserFile.findOne({
            $or: [
                { "files.fileId": objectId },
                { "quittances.fileId": objectId }
            ]
        });

        if (!userFile) {
            console.error("❌ Aucun fichier trouvé pour cet ID :", fileId);
            return res.status(404).json({ error: 'Fichier non trouvé' });
        }

        const userId = userFile.userId;

        await gridfsBucket.delete(objectId);

        const pullQuery = {
            $pull: {
                files: { fileId: objectId },
                quittances: { fileId: objectId }
            }
        };

        await UserFile.updateOne({ userId }, pullQuery);

        res.redirect(`/mes-fichiers/${userId}`);

    } catch (error) {
        console.error('❌ Erreur lors de la suppression du fichier:', error);
        res.status(500).json({ error: 'Erreur serveur lors de la suppression du fichier' });
    }
};



