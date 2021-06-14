// Requires
const express = require('express');
const mongoose = require('mongoose');


// Security Requires
const path = require('path');
const helmet = require('helmet');
const rateLimit = require("express-rate-limit");
require('dotenv').config();

// Routes
const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');

// Connecting to MongoDB
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

// Start the Express app INITIALIZE express app 
const app = express();

// Helmet middlware for safe headers
// Helmet helps you secure your Express apps by setting various HTTP headers
app.use(helmet());

// middleware express-rate-limit pour limiter le nombre de requêtes effectuées
const apiLimiter  =  rateLimit ( { 
  windowMs : 15 * 60 * 1000 ,  // 15 minutes 
  max : 100  // limite chaque IP à 100 requêtes par windowMs 
});
app.use('/api/' ,apiLimiter);

// Statics images
app.use('/images', express.static(path.join(__dirname, 'images')));

//Définition des (headers) en-têtes CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader("x-powered-by" , false);
    //res.setHeader('Content-Security-Policy', "default-src 'self'");
    next();
  });
//for handling form data 
app.use(express.json()); // replace app.use(bodyParser.json()) who's deprecated!!

// Setting routes
app.use('/api/sauces', sauceRoutes); 
app.use('/api/auth', userRoutes);

  module.exports = app;