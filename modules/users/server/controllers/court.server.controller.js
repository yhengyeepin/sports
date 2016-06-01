'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Court = mongoose.model('Court'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Show the current court
 */
exports.read = function (req, res) {
  console.log("reading court" +req.params.id);
  res.json(req.model);
};

/**
 * Update a court
 */
exports.update = function (req, res) {
  var court = req.model;

  console.log("updating court" +req.body.name);
  //For security purposes only merge these parameters
  court.name = req.body.name;
  court.waitingList = req.body.waitingList;
  court.waitingTime = req.body.waitingTime;
  court.currentPlayers = req.body.currentPlayers;
  court.nextPlayers = req.body.nextPlayers;
  court.countDownTime = req.body.countDownTime;

  court.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(court);
  });
};

/**
 * Delete a court, never use
 */
exports.delete = function (req, res) {
  var court = req.model;

  court.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(court);
  });
};

/**
 * List of Courts
 */
exports.list = function (req, res) {
  console.log("listing courts");
  //Member.find().sort('-created').populate('user', 'displayName').exec(function(err, members) {
  Court.find().sort('-created').populate('court', 'name').exec(function (err, courts) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    /*if (courts.length != 0 ) {
        
       //Court var Court = mongoose.model('Court', CourtSchema);
        var court = new Court();
        //initialize courts
        court.name = "1";
        //court.waitingList = req.body.waitingList;
        //court.waitingTime = req.body.waitingTime;
        //court.currentPlayers = req.body.currentPlayers;
        //court.nextPlayers = req.body.nextPlayers;
      
        court.save(function (err) {
          if (err) {
            //return res.status(400).send({
            //  message: errorHandler.getErrorMessage(err)
            //});
          }
        });
      console.log("court not found");
    }*/
    res.json(courts);
  });
};

/**
 * Court middleware
 */
exports.courtByID = function (req, res, next, id) {
  console.log("court by id "+id);
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Court is invalid'
    });
  }

  Court.findById(id, '-salt -password').exec(function (err, court) {
    if (err) {
      return next(err);
    } else if (!court) {
      return next(new Error('Failed to load court ' + id));
    }

    req.model = court;
    next();
  });
};
