const mongoose = require("mongoose");

// définir un modèle
const ChambreSchema = mongoose.Schema({
  nom: {type: String}, 
  position: {type: String},  
  disponibilite: {type: Boolean}, 
  volets: {type: String},
  radiateur: {type: String},
  prises_electriques: {type: Number},
  bureau: {type: Number},
  chaise: {type: Number},
  lit: {type: Number},
  dressing: {type: Number},
  multi_prises: {type: Number},
  oreiller: {type: Number},
  plaid: {type: Number},
  price: {type: Number},
})

const Chambre = mongoose.model('chambres', ChambreSchema)

module.exports = Chambre