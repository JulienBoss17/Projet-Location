const User = require("../MODELS/Users.js");
const Chambre = require("../MODELS/Chambres.js")
const Casse = require('../MODELS/Casses.js'); 
const UserFile = require("../MODELS/Userfiles.js")
const Annonce = require('../MODELS/Annonces.js'); 
const session = require('express-session');
const e = require("express");

const mongoose = require("mongoose")


async function getGridFsBucket() {
    return new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: "uploads" });
}

exports.dashAdmin = async (req, res) => {
    const userFiles = await UserFile.find().populate("userId", "nom prenom role email");
    
    const gridfsBucket = await getGridFsBucket();
    const allFiles = await gridfsBucket.find().toArray();

    const usersWithFiles = await Promise.all(userFiles.map(async (doc) => {
        if (doc.files && doc.files.length > 0) {
            const chambre = await Chambre.findById(doc.chambre);  

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
                }),
                chambre: chambre ? chambre.nom : "Chambre non trouvée", 
            };
        }
    })).then(result => result.filter(user => user !== undefined));

    const chambres = await Chambre.find();

    const users = await User.find({ role: "locataire" });

    const casses = await Casse.find().populate("userId", "nom role prenom");
    res.render("pages/dashboardAdmin", {casses, usersWithFiles, chambres, users});
};


exports.updateChambresPage = async (req, res) => {
    const chambreId = req.params.id
    try {
        const chambre = await Chambre.findById(chambreId)
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
        req.flash("success2", `${req.body.nom} modifié avec succès ! Vous pouvez retourner au tableau de bord.`);
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

        await newCasse.save();

        req.flash("success", "Message enregistrée avec succès !");
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

        await newAnnonce.save();

        req.flash("success", "Annonce enregistrée avec succès !");
        res.redirect("/dashboardadmin");

    } catch (err) {
        console.error('Erreur lors de l’enregistrement de l’annonce:', err.message);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

exports.deleteCasse = async (req, res) => {
    const casseId = req.params.id; 

    try {
        const casse = await Casse.findByIdAndDelete(casseId);

        if (!casse) {
            return res.status(404).json({ message: "Casse non trouvée" });
        }

        res.redirect("/dashboardadmin");

    } catch (err) {
        console.error('Erreur lors de la suppression de la casse:', err.message);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

exports.deleteFiles = async (req, res) => {
    try {
        let userId = req.body.userId?.trim(); 

        if (!userId) {
            return res.status(400).json({ error: "Utilisateur non spécifié" });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "ID utilisateur invalide" });
        }

        const userFiles = await UserFile.findOne({ userId });

        if (!userFiles) {
            return res.status(404).json({ error: "Aucun fichier trouvé pour cet utilisateur" });
        }

        const gridfsBucket = await getGridFsBucket();

        for (const file of userFiles.files) {
            await gridfsBucket.delete(new mongoose.Types.ObjectId(file.fileId));
        }

        await UserFile.deleteOne({ userId });

        req.flash("success2", "la candidature à été supprimé avec succès");
        res.redirect("/dashboardadmin");

    } catch (error) {
        console.error("❌ Erreur lors de la suppression des fichiers :", error);
        res.redirect("/compte");
    }
};

exports.assignChambreToLocataire = async (req, res) => {
    const { userId } = req.params;
    const { chambre } = req.body; 

    try {
        const chambreExiste = await Chambre.findById(chambre);
        if (!chambreExiste) {
            return res.redirect("/dashboardadmin");
        }

        await User.findByIdAndUpdate(userId, { 
            role: "locataire",
            chambre: chambre
        });

        res.redirect("/dashboardadmin");

    } catch (error) {
        console.error("❌ Erreur:", error);
        res.redirect("/dashboardadmin");
    }
};

exports.removeLocataire = async (req, res) => {
    const { userId } = req.params;

    try {
        const userFiles = await UserFile.findOne({ userId });

        if (userFiles) {
            const gridfsBucket = await getGridFsBucket();

            for (const file of userFiles.files) {
                try {
                    await gridfsBucket.delete(new mongoose.Types.ObjectId(file.fileId));
                } catch (err) {
                    console.error(`Erreur lors de la suppression du fichier ${file.fileId}`, err);
                }
            }

            if (userFiles.quittances && userFiles.quittances.length > 0) {
                for (const quittance of userFiles.quittances) {
                    try {
                        await gridfsBucket.delete(new mongoose.Types.ObjectId(quittance.fileId));
                    } catch (err) {
                        console.error(`Erreur lors de la suppression de la quittance ${quittance.fileId}`, err);
                    }
                }
            }
            

            await UserFile.deleteOne({ userId });
        }

        await User.findByIdAndUpdate(userId, {
            role: "un simple utilisateur",
            chambre: null
        });

        res.redirect("/dashboardadmin");

    } catch (error) {
        console.error("❌ Erreur:", error);
        res.redirect("/dashboardadmin");
    }
};


