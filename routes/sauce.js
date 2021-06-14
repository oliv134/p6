const express = require('express');
const router = express.Router();

const auth = require ('../middleware/auth')
const multer = require ('../middleware/multer-config')

const sauceCtrl = require('../controllers/sauce')

// Sauce routes
router.get('/', auth, sauceCtrl.getThings);
router.get('/:id', auth, sauceCtrl.getThing);
router.post('/', auth, multer, sauceCtrl.createThing);
router.put('/:id', auth, multer,  sauceCtrl.modifyThing);
router.delete('/:id', auth, sauceCtrl.deleteThing);
router.post('/:id/like', auth, sauceCtrl.likeThing);

module.exports = router;