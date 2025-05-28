const mongoose = require('mongoose');

const QuittanceSchema = new mongoose.Schema({
    fileId: { type: mongoose.Schema.Types.ObjectId, required: true },
    filename: String,
    originalname: String,
    contentType: String,
    uploadDate: { type: Date, default: Date.now },
    mois: { type: Number, required: true }, 
    annee: { type: Number, required: true }
});

const UserFileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    files: [
        {
            fileId: { type: mongoose.Schema.Types.ObjectId, required: true },
            filename: String,
            originalname: String,
            contentType: String,
            uploadDate: { type: Date, default: Date.now }
        }
    ],
    chambre: { type: mongoose.Schema.Types.ObjectId, ref: 'chambres', default: null },
    quittances: [QuittanceSchema] 
});

module.exports = mongoose.model('UserFile', UserFileSchema);
