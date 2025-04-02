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

        const user1 = await User.findById(req.params.userId);

        const userId = req.params.userId;  // Vérifie bien que userId vient de l'URL

        const userFiles = await UserFile.find({ userId });

        let allFiles = [];
        userFiles.forEach(doc => {
            if (doc.files && doc.files.length > 0) {
                allFiles = allFiles.concat(doc.files);
            }
        });

        res.render('pages/candidature', { 
            files: allFiles, 
            message: null, 
            userId: userId, // Assure-toi qu'il est bien transmis ici
            user1: user1, // Assure-toi qu'il est bien transmis ici
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
            const userId = req.params.userId; // Assurez-vous que l'ID de l'utilisateur est passé dans l'URL
    
            let userFiles = await UserFile.findOne({ userId });
    
            if (!userFiles) {
                userFiles = new UserFile({ userId, files: [] });
            }
    
            const gridfsBucket = await getGridFsBucket();
    
            const uploadStream = gridfsBucket.openUploadStream(req.file.originalname, {
                contentType: req.file.mimetype
            });
    
            uploadStream.end(req.file.buffer);
    
            uploadStream.on('finish', async () => {
                // Ajouter le fichier au tableau des fichiers existants
                userFiles.files.push({
                    fileId: uploadStream.id,
                    filename: req.file.filename,
                    originalname: req.file.originalname,
                    contentType: req.file.mimetype
                });
    
                await userFiles.save();
    
                res.redirect(`/mes-fichiers/${userId}`);
            });
    
            uploadStream.on('error', (error) => {
                console.error("❌ Erreur lors de l'upload GridFS:", error);
                res.redirect(`/mes-fichiers/${userId}`);
            });
    
        } catch (error) {
            console.error("❌ Erreur lors de l'upload:", error);
            res.redirect(`/mes-fichiers/${userId}`);
        }
    });    
}

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

        // 🔍 Trouver quel utilisateur possède ce fichier
        const userFile = await UserFile.findOne({ "files.fileId": objectId });

        if (!userFile) {
            console.error("❌ Aucun fichier trouvé pour cet ID :", fileId);
            return res.status(404).json({ error: 'Fichier non trouvé' });
        }

        const userId = userFile.userId; // Récupérer l'ID de l'utilisateur

        // 🔥 Supprimer le fichier de GridFS
        await gridfsBucket.delete(objectId);

        // 🗑 Supprimer le fichier du tableau dans UserFile
        await UserFile.updateOne(
            { userId }, 
            { $pull: { files: { fileId: objectId } } }
        );

        res.redirect(`/mes-fichiers/${userId}`); // ✅ Maintenant userId est bien défini

    } catch (error) {
        console.error('❌ Erreur lors de la suppression du fichier:', error);
    }
};

