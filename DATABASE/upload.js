const mongoose = require('mongoose');
const multer = require('multer');
const { GridFSBucket } = require('mongodb');
const connectDb = require('../DATABASE/connect');

let gridfsBucket;

const initializeStorage = async () => {
    try {
        const db = await connectDb();
        console.log("✅ Base de données connectée");

        gridfsBucket = new GridFSBucket(db, { bucketName: 'uploads' });
        console.log("✅ GridFSBucket initialisé");

    } catch (err) {
        console.error("❌ Erreur GridFS :", err);
        throw err;
    }
};

// Initialiser GridFS au lancement
const storagePromise = initializeStorage();

// Middleware Multer (stocke en mémoire puis envoie à GridFS)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Fonction pour récupérer GridFSBucket
const getGridFsBucket = async () => {
    if (!gridfsBucket) {
        console.log("⏳ En attente de GridFSBucket...");
        await storagePromise;
    }
    return gridfsBucket;
};

module.exports = { upload, getGridFsBucket };
