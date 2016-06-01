'use strict';

// Courts service used for communicating with the courts REST endpoint
/*angular.module('users.admin').factory('Courts', function($resource) {
  return $resource('/api/courts/:id');
});*/

//TODO this should be Users service
angular.module('users.admin').factory('Courts', ['$resource',
  function ($resource) {
    return $resource('api/courts/:id', {
      id: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);