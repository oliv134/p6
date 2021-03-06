const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const mailValidator = require("email-validator");
const passwordValidator = require('password-validator');
const schema = new passwordValidator();
const maskData = require("maskdata");

require('dotenv').config();

// Email Mask
const emailMask2Options = {
  maskWith: "*", 
  unmaskedStartCharactersBeforeAt: 5,
  unmaskedEndCharactersAfterAt: 5, // Give a number which is more than the characters after @
  maskAtTheRate: false
};

// Password Validation Schema
schema.is().min(8)                                    // Minimum length 8
schema.is().max(100)                                  // Maximum length 100
schema.has().uppercase()                              // Must have uppercase letters
schema.has().lowercase()                              // Must have lowercase letters
schema.has().digits(2)                                // Must have at least 2 digits
schema.has().not().spaces()                           // Should not have spaces
schema.is().not().oneOf(['Passw0rd', 'Password123', 'qwertyuiop', 'qwerty', 'azertyuiop', 'azerty']); // Blacklist these values


/**
* Controller allowing to create a new user account
*/
exports.signup = (req, res, next) => {
  if (!mailValidator.validate(req.body.email)) {
    // Making sure the amil is an email
    return res.status(400).json({ message: "Email incorrect" })
  };

  if (schema.validate(req.body.password)) {
    bcrypt.hash(req.body.password, 10)
      .then(hash => {
        const user = new User({
          //email: maskData.maskEmail2(req.body.email, emailMask2Options), // With maskdata
          email: req.body.email,
          password: hash
        });
        user.save()
          .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
          .catch(error => res.status(400).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
  } else {
    //(schema.validate(req.body.password, { list: true }));
    res.status(400).json({ message: schema.validate(req.body.password, { list: true })})
  } 
};

/**
* Controller allowing to log in
*/
exports.login = (req, res, next) => {
  // User.findOne({email:maskData.maskEmail2(req.body.email, emailMaskOptions)}) // With maskdata
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé !' });
      }
      // hash password
      bcrypt.compare(req.body.password, user.password)
        .then(valid => {
          if (!valid) {
            return res.status(401).json({ error: 'Mot de passe incorrect !' });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              { userId: user._id },
              process.env.SESSION_KEY,
              { expiresIn: '24h' }
            )
          });
        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};