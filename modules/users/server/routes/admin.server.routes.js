'use strict';

/**
 * Module dependencies.
 */
var adminPolicy = require('../policies/admin.server.policy'),
  admin = require('../controllers/admin.server.controller'),
  court = require('../controllers/court.server.controller');

module.exports = function (app) {
  // User route registration first. Ref: #713
  require('./users.server.routes.js')(app);

  // Users collection routes
  app.route('/api/users')
    .get(adminPolicy.isAllowed, admin.list);

  // Single user routes
  app.route('/api/users/:userId')
    .get(adminPolicy.isAllowed, admin.read)
    .put(adminPolicy.isAllowed, admin.update)
    .delete(adminPolicy.isAllowed, admin.delete);
  
  app.route('/api/courts').get(adminPolicy.isAllowed, court.list);

  app.route('/api/courts/:id')
    .get(adminPolicy.isAllowed, court.read)
    .put(adminPolicy.isAllowed, court.update)
    .delete(adminPolicy.isAllowed, court.delete);
    
  // Finish by binding the user middleware
  app.param('userId', admin.userByID);
  
  app.param('id', court.courtByID);

};
