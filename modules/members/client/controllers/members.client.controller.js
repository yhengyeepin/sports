(function () {
  'use strict';

  // Members controller
  angular
    .module('members')
    .controller('MembersController', MembersController);

  MembersController.$inject = ['$scope', '$state', 'Authentication', 'memberResolve'];

  function MembersController ($scope, $state, Authentication, member) {
    var vm = this;

    vm.authentication = Authentication;
    vm.member = member;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Member
    function remove() {
      if (confirm('Are you sure you want to delete?')) {
        vm.member.$remove($state.go('members.list'));
      }
    }

    // Save Member
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.memberForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.member._id) {
        vm.member.$update(successCallback, errorCallback);
      } else {
        vm.member.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('members.view', {
          memberId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
})();
