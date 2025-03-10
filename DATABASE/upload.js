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

const storagePromise = initializeStorage();

const storage = multer.memoryStorage();
const upload = multer({ storage });

const getGridFsBucket = async () => {
    if (!gridfsBucket) {
        await storagePromise;
    }
    return gridfsBucket;
};

module.exports = { upload, getGridFsBucket };
