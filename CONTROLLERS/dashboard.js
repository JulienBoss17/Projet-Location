const User = require("../MODELS/Users.js");
const Casse = require('../MODELS/Casses.js'); // Import du modèle Casse
const Annonce = require('../MODELS/Annonces.js'); // Import du modèle Annonce
const session = require('express-session');
const e = require("express");

exports.dashAdmin = async (req, res) => {
    console.log("dashAdmin")
    res.render("pages/dashboardAdmin");
};

exports.dashLocataire = async (req, res) => {
    console.log("dashLocataire")
    res.render("pages/dashboardLocataire");
};

exports.casses = async (req, res) => {
    console.log("Déclaration de casse reçue");

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

    console.log("Annonce reçue");

    const userId = req.params.userId; 
    const { titre, description, dateAnnonce } = req.body; 

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        const newAnnonce = new Annonce({
            userId,
            titre,
            description,
            dateAnnonce: dateAnnonce || new Date()
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