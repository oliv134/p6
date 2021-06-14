const { json } = require("express");
const Sauce = require("../models/sauce");
const fs = require("fs");
const sauce = require("../models/sauce");

/**
* Controller allowing to create Sauce
*/
exports.createThing = (req, res, next) => {
  //console.log(req.body.sauce);
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  sauce
    .save()
    .then(() => res.status(201).json({ message: "Objet enregistré !" }))
    .catch((error) => res.status(400).json({ error }));
};

/**
* Controller allowing to get One Sauce
*/
exports.getThing = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

/**
* Controller allowing to get All Sauces
*/
exports.getThings = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

/**
* Controller allowing to modify One Sauce
*/
exports.modifyThing = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  Sauce.updateOne(
    { _id: req.params.id },
    { ...sauceObject, _id: req.params.id }
  )
    .then(() => res.status(200).json({ message: "Objet modifié !" }))
    .catch((error) => res.status(400).json({ error }));
};

/**
* Controller allowing to delete One Sauce
*/
exports.deleteThing = (req, res, next) => {
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
exports.likeThing = (req, res, next) => {
  //console.log(req.body.userId);
  switch (req.body.like) {
    case 1: // like sauce
      //console.log("like");
      Sauce.updateOne(
        { _id: req.params.id },
        { $inc: { likes: 1 },
         $push: { usersLiked: req.body.userId } }
      )
      
        .then((sauce) => res.status(200).json(sauce))
        .catch((error) => res.status(404).json({ error }));
      break;
    case 0: // cancel like or dislike
      //console.log("cancel");
      sauce.findOne({ _id: req.params.id })
        .then(sauce => {
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
        { $inc: { dislikes: 1 } ,
         $push: { usersDisliked: req.body.userId } }
      )
      
        .then((sauce) => res.status(200).json(sauce))
        .catch((error) => res.status(404).json({ error }));
      break;
  }

};