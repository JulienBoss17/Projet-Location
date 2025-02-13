const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const multer = require('multer');

const connectDb = require('../DATABASE/connect');

let gfs;
const initializeStorage = async () => {
    const db = await connectDb();
    console.log("✅ Base de données connectée");

    // Initialiser GridFS
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

const upload = multer({ storage });

initializeStorage().catch(err => console.error("❌ Erreur GridFS :", err));

module.exports = upload;
