const mongoose = require('mongoose');

const UserFileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    files: [
        {
            fileId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Ajout de fileId
            filename: String,
            originalname: String,
            contentType: String,
            uploadDate: { type: Date, default: Date.now }
        }
    ]
});

module.exports = mongoose.model('UserFile', UserFileSchema);
