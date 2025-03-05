const mongoose = require('mongoose');

const casseSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    description: { type: String, required: true },
    dateCasse: { type: Date, required: true, default: Date.now } // Date par défaut : aujourd'hui
});

module.exports = mongoose.model('Casses', casseSchema);
