const mongoose = require("mongoose");
const validator = require("validator");

const UserSchema = mongoose.Schema({
    email: {
      type: String, 
      required: true, 
      unique: true,
      validate: {
        validator: function(value) {
          return validator.isEmail(value)
        },
        message: "Adresse e-mail invalide"
      }
    },
    prenom: {type: String},
    nom: {type: String},
    password: {type: String},
    role: {type: String, enum: ['admin', 'locataire', 'un simple utilisateur'], default: 'un simple utilisateur'},
    status: {
      type: String,
      enum: ['Connecté', 'Non connecté'], 
      default: 'Non connecté'
    },
    chambre: { type: mongoose.Schema.Types.ObjectId, ref: 'chambres', default: null } 
})

const User = mongoose.model('users', UserSchema)

module.exports = User