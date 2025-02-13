const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const multer = require('multer');

const connectDb = require('../DATABASE/connect');

let gfs;
const initializeStorage = async () => {
    const db = await connectDb();
    console.log("✅ Base de données connectée");

    gfs = Grid(db, mongoose.mongo);
    gfs.collection('uploads');

    console.log("✅ GridFS initialisé");
};

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Type de fichier non autorisé"), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

initializeStorage().catch(err => console.error("❌ Erreur GridFS :", err));

module.exports = upload;
