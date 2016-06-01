(function () {
  'use strict';

  angular
    .module('members')
    .controller('MembersListController', MembersListController);

  MembersListController.$inject = ['MembersService'];

  function MembersListController(MembersService) {
    var vm = this;

    vm.members = MembersService.query();
  }
})();
