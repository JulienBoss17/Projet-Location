const Chambre = require("../MODELS/Chambres.js");
const User = require("../MODELS/Users.js");
const bcrypt = require("bcrypt");
const session = require('express-session');
const e = require("express");
const validator = require("validator");

exports.home = async (req, res) => {
    try {
        const status = req.session.status || 'Non connecté';  
        const chambres = await Chambre.find();
        const chdispo = await Chambre.find({disponibilite: true});
        const chindispo = await Chambre.find({disponibilite: false});
        res.render("PAGES/home", { chambres, status, chdispo, chindispo });
    } catch (err) {
        console.error('Erreur dans getBooks:', err.message);
        res.status(500).json({ message: err.message });
    }
  };

exports.compte = async (req, res) => {
    res.render("PAGES/users", {message: req.flash() });
};

exports.showUsers =  async (req, res) => {
    const userId = req.params.id
    try {
        const user = await User.findById(userId)
        res.render("pages/showUser", { user });
    }
    catch(err) {
        res.status(500).json({message: err.message})
    }
};

exports.newUsers = async (req, res) => {
    try {
            const { email, password } = req.body;
    
            if (!validator.isEmail(email)) {
                req.flash("error", "Email invalide !");
                return res.redirect("/compte"); 
            }
    
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                req.flash("error", "Utilisateur déjà existant, veuillez essayer de vous connecter.");
                return res.redirect("/compte"); 
            }
    
            if (!password) {
                return res.status(400).json({ message: "Mot de passe requis" });
            }
    
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({ ...req.body, password: hashedPassword });
            console.log(newUser);
    
            await newUser.save();
    
            req.flash("success", "Compte créé avec succès ! Vous pouvez maintenant vous connecter.");
            return res.redirect("/compte"); 
    
        } catch (err) {
            if (!res.headersSent) {  
                console.error("Erreur lors de l'inscription :", err);
                return res.status(500).json({ message: err.message });
            }
        }
};

exports.loginUsers = async (req, res) => {
        try {
            const user = await User.findOne({ email: req.body.email});
    
            if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
                req.flash("error", "Email ou mot de passe incorrect !");
                return res.redirect('/compte');
            }
    
            user.status = 'Connecté'; 
            await user.save();
    
            req.session.user = user;
            req.session.userId = user._id;
            req.session.status = user.status;
    
            req.session.save(err => {
                if (err) {
                    console.error('Erreur lors de la sauvegarde de la session:', err);
                    return res.status(500).send('Erreur serveur.');
                }
                res.redirect('/'); 
            });
        } catch (error) {
            console.error('Erreur lors de la tentative de connexion:', error);
            res.status(500).send('Erreur serveur.');
        }
};

exports.logoutUsers = async (req, res) => {
    try {
        const userId = req.session.userId;  

        if (!userId) {
            return res.redirect('/');
        }

        const user = await User.findById(userId);

        if (user) {
            user.status = 'Non connecté';
            await user.save();
        }

        req.session.destroy(err => {
            if (err) {
                return res.status(500).send('Erreur lors de la déconnexion');
            }
            res.redirect('/'); 
        });
    } catch (err) {
        console.error('Erreur lors de la déconnexion:', err.message);
        res.status(500).json({ message: err.message });
    }
};

exports.deleteUsersPage = async (req, res) => {
        res.render("pages/deleteUser");
    }
exports.deleteUsers = async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await User.findByIdAndDelete(userId);

        if (req.session.userId === userId) {
            req.session.status = 'Non connecté'; 
            req.session.userId = null; 
            req.session.user = null; 

            req.session.save(err => {
                if (err) {
                    console.error('Erreur lors de la mise à jour de la session:', err);
                    return res.status(500).send('Erreur serveur.');
                }
                res.redirect("/compte");
            });
        } else {
            res.redirect("/compte");
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateUsersPage = async (req, res) => {
    const userId = req.params.id
    try {
        const user = await User.findById(userId)
        res.render("pages/updateUser", { user });
    }
    catch(err) {
        res.status(500).json({message: err.message})
    }
};

exports.updateUsers = async (req,res) => {
  const userId = req.params.id
  try{
      const user = await User.findByIdAndUpdate(userId, req.body,  {new: true})
      req.flash("success2", "Utilisateur modifié avec succès !");
      res.redirect("/showuser/" + userId);
  }
  catch(err) {
      res.status(404).json({message: err.message})
  }
};

exports.showChambres = async (req, res) => {
    const chambreId = req.params.id
    try {
        const chambre = await Chambre.findById(chambreId)
        res.render("pages/showChambre", { chambre });
    }
    catch(err) {
        res.status(500).json({message: err.message})
    }
}
