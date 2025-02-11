const Chambre = require("../MODELS/Chambres.js");
const User = require("../MODELS/Users.js");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const session = require('express-session');
const generateToken = require("../DATABASE/generatetoken.js");

exports.home = async (req, res) => {
    try {
        const status = req.session.status || 'Non connecté';  
        console.log('Statut actuel de la session:', status);  
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
    res.render("PAGES/users");
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
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        req.body.password = hashedPassword;
        console.log(req.body)
        const newUser = new User(req.body)
        let user = await newUser.save()
        // res.status(201).json({U})
        res.redirect("/compte");
    }
    catch(err) {
        res.status(500).json({message: err.message})
    }
};

exports.loginUsers = async (req, res) => {
    try {
        const user = await User.findOne({ nom: req.body.nom });

        if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
            return res.redirect('/compte');
        }

        user.status = 'Connecté'; 
        await user.save();

        const token = generateToken(user);

        req.session.token = token;
        req.session.user = user;
        req.session.userId = user._id;
        req.session.status = user.status;

        req.session.save(err => {
            if (err) {
                console.error('Erreur lors de la sauvegarde de la session:', err);
                return res.status(500).send('Erreur serveur.');
            }
            res.redirect('/compte'); 
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
            return res.status(400).json({ message: "L'utilisateur n'est pas connecté" });
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

exports.dashAdmin = async (req, res) => {
    console.log("dashAdmin")
    res.render("pages/dashboardAdmin");
};

exports.dashLocataire = async (req, res) => {
    console.log("dashLocataire")
    res.render("pages/dashboardLocataire");
};