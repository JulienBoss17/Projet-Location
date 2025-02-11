const mongoose = require("mongoose");

//fonction de connexion à la base de données
async function connectDb() {
  try {
    await mongoose.connect(process.env.MONGO_URI + process.env.DB_NAME);
    console.log(`Successfully connected ${process.env.DB_NAME} database`);
  } catch (err) {
    console.log("Error connecting to MongoDB:", err);
  }
}

module.exports = connectDb;
