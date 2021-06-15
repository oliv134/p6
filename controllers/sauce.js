const { json } = require("express");
const Sauce = require("../models/sauce");
const fs = require("fs");

// regex injection prevent
const regex = /^[a-zA-Z0-9 _.,!()&]+$/;

/**
* Controller allowing to create Sauce
*/
exports.createSauce = (req, res, next) => {
  //console.log(req.body.sauce);
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  // Check format
  if (testSauce(sauceObject))
  {
    res.status(400).json({ message: "Syntaxe incorrecte" })
  }

  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  sauce.save()
    .then(() => res.status(201).json({ message: "Sauce enregistrée !" }))
    .catch((error) => res.status(400).json({ error }));
  
};

/**
* Controller allowing to get One Sauce
*/
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

/**
* Controller allowing to get All Sauces
*/
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(404).json({ error }));
};

/**
* Controller allowing to modify One Sauce
*/
exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
    if (testSauce(sauceObject))
    {
      res.status(400).json({ message: "Syntaxe incorrecte" })
    }
  Sauce.updateOne(
    { _id: req.params.id },
    { ...sauceObject, _id: req.params.id }
  )
    .then(() => res.status(200).json({ message: "Sauce modifiée !" }))
    .catch((error) => res.status(400).json({ error }));
};

/**
* Controller allowing to delete One Sauce
*/
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Objet supprimé !" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

/**
* Controller allowing to like, unlike, dislike or undislinke a sauce
*/
exports.likeSauce = (req, res, next) => {
  //console.log(req.body.userId);
  switch (req.body.like) {
    case 1: // like sauce
      //console.log("like");
      Sauce.updateOne(
        { _id: req.params.id },
        { $inc: { likes: 1 }, // increase likes by 1
         $push: { usersLiked: req.body.userId } } // and add userId to usersLiked
      )      
        .then((sauce) => res.status(200).json(sauce))
        .catch((error) => res.status(400).json({ error }));
      break;
    case 0: // cancel like or dislike
      //console.log("cancel");
      Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
          // if userId is in usersLiked then decrement like by 1 and remove userId from userLiked
          if (sauce.usersLiked.includes(req.body.userId)) {
            Sauce.updateOne(
              { _id: req.params.id },
              { 
                $inc: { likes: -1 },
                $pull: { usersLiked: req.body.userId}
              }
            )
              .then((sauce) => { res.status(200).json({ message: 'Like supprimé !' }) })
              .catch(error => res.status(400).json({ error }))
            // else the user is in usersDisliked. So decrement disklike by 1 and remove userId from userDisliked
          } else if (sauce.usersDisliked.includes(req.body.userId)) {
            Sauce.updateOne(
              { _id: req.params.id },
              { 
                $inc: { dislikes: -1 },
                $pull: { usersDisliked: req.body.userId}
              }
            )
              .then((sauce) => { res.status(200).json({ message: 'Dislike supprimé !' }) })
              .catch(error => res.status(400).json({ error }))

          }
        })
        .catch((error) => res.status(404).json({ error }));
      break;
      
    case -1: // dislike sauce
      //console.log("dislike");
      Sauce.updateOne(
        { _id: req.params.id },
        { $inc: { dislikes: 1 } , // increase dislikes by 1
         $push: { usersDisliked: req.body.userId } } // and add userId to usersDisliked
      )
      
        .then((sauce) => res.status(200).json(sauce))
        .catch((error) => res.status(400).json({ error }));
      break;
  };
};

const testSauce = (sauceObject) => {
  return (
    !regex.test(sauceObject.name) ||
    !regex.test(sauceObject.manufacturer) ||
    !regex.test(sauceObject.description) ||
    !regex.test(sauceObject.mainPepper) ||
    !regex.test(sauceObject.heat)
  )
};