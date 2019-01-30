const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');
const Favorites = require('../models/favorite');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => {res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {

    Favorites.findOne({user: req.user._id})
    .populate('user')
    .populate('dishes')
    .then((favorites) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(favorites);
    }, (err) => next(err))
    .catch((err) => next(err))
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  Favorites.findOne({user: req.user._id})
  .then((favorites) => {
    if(favorites != null){
      /*var dishesID = [];
      $.each(req.body, function(key, ob){
        dishesID.push(ob);
      });*/

      for(var i= (req.body.length-1); i>=0; i--){
        if(favorites.dishes.indexOf(req.body[i]._id) != -1){
          favorites.dishes.splice(favorites.dishes.indexOf(req.body[i]._id), 1);
          favorites.dishes.push(req.body[i]._id);
        }
        else{
          favorites.dishes.push(req.body[i]._id);
        }
      }
      favorites.save()
      .then((favs) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favs);  //Will take as an input json stirng and then will send it back over
      }, (err) => next(err))
      .catch((err) => next(err));
    }
    else{
      Favorites.create({user: req.user._id})
      .then((favorites) => {
      /*  var dishesID = [];
        $.each(req.body, function(key, ob){
          dishesID.push(ob);
        });*/

        for(var i= (req.body.length-1); i>=0; i--){
            favorites.dishes.push(req.body[i]._id);
        }
        favorites.save()
        .then((favorites) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(favorites);
        }, (err) => next(err))
        .catch((err) => next(err));
      }, (err) => next(err))
      .catch((err) => next(err));
    }
  }, (err) => next(err))
  .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  res.statusCode = 403;
  res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  Favorites.findOneAndRemove({user: req.user._id})
  .then((resp) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(resp);
  }, (err) => next(err))
  .catch((err) => next(err));
});


favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => {res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  res.statusCode = 403;
  res.end('GET operation not supported on /favorites/:' +req.params.dishId);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  Favorites.findOne({user: req.user._id})
  .then((favorites) => {

    if(favorites != null){
      if(favorites.dishes.indexOf(req.params.dishId) != -1){
        var err = new Error('This dish already exsist in the favorites list!');
        err.status = 409;
        return next(err);
      }
      else{
        // i ova nemashe jas imav napraeno favorites.dishes.push(req.params.dishId);
        favorites.dishes.push(req.params.dishId);
        favorites.save()
        .then((favorites) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(favorites);  //Will take as an input json stirng and then will send it back over
        }, (err) => next(err))
        .catch((err) => next(err));
      }
    }
    else{
      Favorites.create({user: req.user._id})
      .then((favorites) => {
        favorites.dishes.push(req.params.dishId); //Ova nemashe da mi tekne...
        favorites.save()
        .then((favorites) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(favorites);
        }, (err) => next(err))
        .catch((err) => next(err));
      }, (err) => next(err))
      .catch((err) => next(err));
    }
  }, (err) => next(err))
  .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  res.statusCode = 403;
  res.end('PUT operation not supported on /favorites/:'+req.params.dishId);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  Favorites.findOne({user: req.user._id})
  .then((favorites) => {
    if(favorites != null){
      if(favorites.dishes.indexOf(req.params.dishId) != -1){
        favorites.dishes.splice(favorites.dishes.indexOf(req.params.dishId), 1);
        favorites.save()
        .then((favorites) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(favorites);  //Will take as an input json stirng and then will send it back over
        }, (err) => next(err));
      }
      else{
        var err = new Error('This dish is not in your favorites list!');
        err.status = 404;
        return next(err);
      }
    }
  }, (err) => next(err))
  .catch((err) => next(err));
});

module.exports = favoriteRouter;
