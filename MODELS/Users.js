const mongoose = require("mongoose");
const validator = require("validator");

// définir un modèle
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
})

const User = mongoose.model('users', UserSchema)

module.exports = User