require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require("express-rate-limit");
const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');

const path = require('path');
const app = express();

mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(helmet());
const apiLimiter  =  rateLimit ( { 
  windowMs : 15 * 60 * 1000 ,  // 15 minutes 
  max : 100  // limite chaque IP à 100 requêtes par windowMs 
} ) ;
app.use('/api/' ,apiLimiter);
  app.use('/images', express.static(path.join(__dirname, 'images')));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });  
  app.use(express.json()); // replace app.use(bodyParser.json()) who's deprecated!!
  app.use('/api/sauces', sauceRoutes); 
  app.use('/api/auth', userRoutes);

  module.exports = app;