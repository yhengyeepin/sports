'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  validator = require('validator');



/**
 * Court Schema
 */
var CourtSchema = new Schema({
  name: {
    type: String,
    default: ''
  },
  countDownTime: {
    type: Number,
    default: 0
  },
  waitingList: {
    type: Array,
    default: []
  },
  waitingTime: {
    type: Number,
    default: 0
  },
  currentPlayers: {
    type: Array,
    default: []
  },
  nextPlayers: {
    type : Array , 
    default : [] 
  }
});


mongoose.model('Court', CourtSchema);
