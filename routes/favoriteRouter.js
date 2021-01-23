const express = require("express");
const authenticate = require("../authenticate");
const cors = require("./cors");
const Favorite = require("../models/favorite");

const favoriteRouter = express.Router();

favoriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ user: req.user._id })
      .populate("user", "campsite")
      .then((favorite) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(favorite);
      })
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id }).then((favorite) => {
      if (favorite) {
          console.log(favorite)
        //[{"_id":"5e56efb8bc577155cbb46003"}, {"_id":"5e56efb8bc577155cbb46004"}] req.body
        req.body.forEach((campsite) => {
          if (!favorite.campsites.includes(campsite._id)) {
            favorite.campsites.push(campsite._id);
          } 
        });
        favorite
          .save()
          .then((response) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(response);
          })
          .catch((err) => next(err));
      } else {
        Favorite.create({ user: req.user._id })
          .then((favorite) => {
              console.log(favorite, "41")
              console.log(req.body)
              console.log(favorite.campsites)
            req.body.forEach((campsite) => {
              if (!favorite.campsites.includes(campsite._id)) {
                favorite.campsites.push(campsite._id);
              }
            });
            favorite.save().then((favorite) => {
              res.statusCode = 200;
              console.log(favorite, "50");
              res.setHeader("Content-Type", "application/json");
              res.json(favorite);
            })
            .catch((err) => next(err));
          })
          .catch((err) => next(err));
      }
    });
  })
  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      res.statusCode = 403;
      res.end("PUT operation not supported on /favorites");
    }
  )
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({ user: req.user._id }).then((favorite) => {
      if (favorite) {
            res.statusCode = 200;
            res.json(favorite);
      } else {
        res.json("You do not have any favorites to delete");
      }
    });
  });

favoriteRouter
  .route("/:campsiteId")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, (req, res, next) => {
    res.statusCode = 403;
    res.end("GET operation not supported on /favorites/:campsiteId");
  })

  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
    .then((favorite) => {
      if (favorite) {
        if (!favorite.campsites.includes(req.params.campsiteId)) {
          favorite.campsites.push(req.params.campsiteId);
          favorite
            .save()
            .then((response) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(response);
            })
            .catch((err) => next(err));
        } else {
          res.json("This campsite is already a favorite");
        }
      } else {
        Favorite.create({ user: req.user._id, campsites: [req.params.campsiteId] })
          .then((favorite) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorite);
          })
          .catch((err) => next(err));
      }
    })
    .catch((err) => next(err));
  })
  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      res.statusCode = 403;
      res.end("PUT operation not supported on /favorites");
    }
  )
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Favorite.findOne({ user: req.user._id })
      .then((favorite) => {
        if (favorite) {
            let index = favorite.campsites.indexOf(req.params.campsiteId);
            if (index !== -1) {
                favorite.campsites.splice(index, 1);
                favorite
                .save()
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "applications/json");
                    res.json(favorite)
                })
                .catch((err) => next(err));
            } else {
                res.send('This campsite is not in your favorites list')
            }
            
        } else {
            res.send("You have no favorites");
        }
      })
      .catch((err) => next(err));
    }
  );

module.exports = favoriteRouter;
