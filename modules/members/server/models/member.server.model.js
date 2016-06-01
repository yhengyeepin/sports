'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Member Schema
 */
var MemberSchema = new Schema({
  phone: {
    type: Number,
    default: '',
    required: 'You\'ll use this to reserve court or reset your password.',
    trim: true
  },
  email: {
    type: String,
    default: '',
    required: 'Please fill your email',
    trim: true  
  },
  firstname: {
    type: String,
    default: '',
    required: 'Please fill your first name',
    trim: true  
  },
  lastname: {
    type: String,
    default: '',
    required: 'Please fill your last name',
    trim: true  
  },
  isMember: {
    type: Boolean,
    default: false,
  },
  membership: {
    effectiveDate: Date,
    expirationDate: Date,
    description: String
  },
  membershipHistory: {
    type : Array , 
    default : [] 
  },
  dropin: {
    type: Date
  },
  dropinHistory: {
    type : Array , 
    default : [] 
  },
  qrcode: {
    type: String
  },
  groups: [{
    name : String
  }],
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Member', MemberSchema);
