const mongoose = require('mongoose');

const annonceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    titre : { type: String, required: true },
    description: { type: String, required: true },
    dateAnnonce: { type: Date, required: true, default: Date.now } 
});

module.exports = mongoose.model('Annonces', annonceSchema);