const User = require("../MODELS/Users.js");
const Chambre = require("../MODELS/Chambres.js")
const Casse = require('../MODELS/Casses.js'); // Import du modèle Casse
const UserFile = require("../MODELS/Userfiles.js")
const Annonce = require('../MODELS/Annonces.js'); // Import du modèle Annonce
const session = require('express-session');
const e = require("express");

const mongoose = require("mongoose")


async function getGridFsBucket() {
    return new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: "uploads" });
}

exports.dashAdmin = async (req, res) => {
    const userFiles = await UserFile.find().populate("userId", "nom prenom role");

    const gridfsBucket = await getGridFsBucket();
    const allFiles = await gridfsBucket.find().toArray();

    const usersWithFiles = userFiles.map(doc => {
        if (doc.files && doc.files.length > 0) {
            return {
                user: doc.userId,
                files: doc.files.map(file => {
                    const gridFile = allFiles.find(f => f._id.toString() === file.fileId.toString());
                    return {
                        fileId: file.fileId,
                        filename: gridFile ? gridFile.filename : "Nom inconnu",
                        contentType: gridFile ? gridFile.contentType : "Type inconnu",
                        uploadDate: file.uploadDate,
                    };
                })
            };
        }
    }).filter(user => user !== undefined);

    const chambres = await Chambre.find();

    const casses = await Casse.find().populate("userId", "nom role prenom");
    res.render("pages/dashboardAdmin", {casses, usersWithFiles, chambres});
};

exports.updateChambresPage = async (req, res) => {
    const chambreId = req.params.id
    try {
        const chambre = await Chambre.findById(chambreId)
        console.log(chambre)
        res.render("pages/updateChambre", { chambre });
    }
    catch(err) {
        res.status(500).json({message: err.message})
    }
}

exports.updateChambre = async (req, res) => {
    const chambreId = req.params.id
    try{
        const chambre = await Chambre.findByIdAndUpdate(chambreId, req.body,  {new: true})
        req.flash("success2", `${req.body.nom} modifié avec succès ! Vous pouvez retourner au Dashboard.`);
        res.redirect("/updatechambres/" + chambreId);
    }
    catch(err) {
        res.status(404).json({message: err.message})
    }
}


exports.dashLocataire = async (req, res) => {
    try {
        const annonces = await Annonce.find().populate("userId", "nom role prenom");

        res.render("pages/dashboardLocataire", { annonces });
    } catch (err) {
        console.error("Erreur lors du chargement des annonces:", err.message);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

exports.casses = async (req, res) => {

    const userId = req.params.userId; 
    const { description, dateCasse } = req.body; 

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        const newCasse = new Casse({
            userId,
            description,
            dateCasse: dateCasse || new Date()
        });

        // Sauvegarde dans la base de données
        await newCasse.save();

        req.flash("success", "Casse enregistrée avec succès !");
        res.redirect("/dashboardlocataire");

    } catch (err) {
        console.error('Erreur lors de l’enregistrement de la casse:', err.message);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

exports.annonces = async (req, res) => {

    const userId = req.params.userId; 
    const { titre, description, dateAnnonce } = req.body; 

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        await Annonce.deleteMany()

        const newAnnonce = new Annonce({
            userId,
            titre,
            description,
            dateAnnonce
        });

        // Sauvegarde dans la base de données
        await newAnnonce.save();

        req.flash("success", "Annonce enregistrée avec succès !");
        res.redirect("/dashboardadmin");

    } catch (err) {
        console.error('Erreur lors de l’enregistrement de l’annonce:', err.message);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

exports.deleteAllCasse = async (req, res) => {
    try {
        await Casse.deleteMany(); 
        res.redirect("/dashboardadmin"); 
    } catch (err) {
        console.error("Erreur lors de la suppression :", err.message);
        res.status(500).json({ message: err.message });
    }
};
