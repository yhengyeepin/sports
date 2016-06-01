//Members service used to communicate Members REST endpoints
(function () {
  'use strict';

  angular
    .module('members')
    .factory('MembersService', MembersService);

  MembersService.$inject = ['$resource'];

  function MembersService($resource) {
    return $resource('api/members/:memberId', {
      memberId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
})();
