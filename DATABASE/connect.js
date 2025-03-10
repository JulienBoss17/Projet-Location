const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGO_URI;

let dbInstance = null; 

const connectDb = async () => {
    if (dbInstance) {
        return dbInstance; 
    }
    try {
        const conn = await mongoose.connect(MONGODB_URI);

        dbInstance = conn.connection;
        console.log("✅ Connecté à MongoDB");
        return dbInstance;
    } catch (error) {
        console.error("❌ Erreur de connexion à MongoDB:", error);
        process.exit(1);
    }
};

module.exports = connectDb;

