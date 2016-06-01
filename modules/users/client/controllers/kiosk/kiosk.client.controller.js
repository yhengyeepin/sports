'use strict';

angular.module('users.admin', [ 'timer', 'ngMaterial', 'ngAria', 'ngAnimate', 'ngMessages', 'ngResource' ]).controller('KioskController', [ '$scope', '$timeout', 'Courts', function($scope, $timeout, Courts) {

  Courts.query(function (data) {
      $scope.courts = data;
      for (var i=0; i < $scope.courts.length; i++) {
        // update groups waiting
        if ($scope.courts[i].countDownTime === 0) {
          $scope.court.playTimeLeft = "Open";
        } else if ($scope.courts[i].countDownTime > 60)
          $scope.court.playTimeLeft = Math.round($scope.courts[i].countDownTime/60) + " min";
        else
          $scope.court.playTimeLeft = $scope.courts[i].countDownTime + " s";
        
        if ($scope.courts[i].waitingList.length < 2) {
          $scope.courts[i].groupsWaiting = 'No line';
        } else {
          $scope.courts[i].groupsWaiting = ($scope.courts[i].waitingList.length - 1) + ' group(s) waiting';
        }
        
        if ($scope.courts[i].waitingList.length > 0) {
          $scope.courts[i].currentOrNextPlayers = 'Current: ' + $scope.courts[i].waitingList[0].join(', ');
        }
        // display next players when it is < 10 minutes and there is a next group
        else if ($scope.courts[i].waitingList.length > 1) {
          $scope.courts[i].currentOrNextPlayers = 'Next: ' + $scope.courts[i].waitingList[1].join(', ');
        }
    
        if ($scope.courts[i].waitingList.length === 0) {
          $scope.courts[i].currentOrNextPlayers = '';
        }        
            
      }
    });

  

} ]).controller('CourtController', [ '$scope', '$timeout', '$mdDialog', 'Courts', '$resource', function($scope, $timeout, $mdDialog, Courts, $resource) {

  $scope.members = [ {
    name : 'John',
    signup : false,
    gender : 'boy'
  }, {
    name : 'Kayce',
    signup : false,
    gender : 'girl'
  }, {
    name : 'Bing',
    signup : false,
    gender : 'girl'
  }, {
    name : 'Jessie',
    signup : false,
    gender : 'girl'
  } ];

  var chance = new Chance();
  for (var i = 0; i < 30; i++) {
    $scope.members.push ({ name: chance.first(), signup: false, gender: 'boy'});
  }


  $scope.signup = function($index, ev) {
    // var chance = new Chance();
    //console.log("$scope.courts "+$scope.courts);
    //$scope.courtName = $index + 1;
    $mdDialog.show({
      controller : SignUpDialogController,
      templateUrl : 'modules/users/client/views/kiosk/signup-court.client.view.html',
      locals : {
        parentScope: $scope,
        waitingList : $scope.waitingList,
        courtName: $index+1,
        waitingTime: $scope.waitingTime,
        courts: $scope.courts
      },
      //scope: this,
      controllerAs : 'ctrl',
      bindToController : true,
      ariaLabel : 'Sign up for Court',
      parent : angular.element(document.body),
      targetEvent : ev,
      clickOutsideToClose : true
    /*
     * , fullscreen: useFullScreen
     */
    });

    function copyWaitingList(waitingList) {
      var out = [];
      for (var i = 0; i < waitingList.length ; i++) {
        var group = waitingList[i];
        var players = [];
        for (var j = 0; j < group.length ; j++)
          players.push(group[j]);
        out.push(players);
      }
      return out;
    }

    function SignUpDialogController($scope, waitingList, courtName, waitingTime, courts, parentScope) {

      $scope.merge = {
             value : false
           };
      //$scope.waitingList = $scope.lines;
      $scope.courtName = courtName;
      $scope.court = courts[courtName-1];
      
      $scope.committedWaitingList = $scope.court.waitingList;
      //cloning the waiting list, this is what user sees before committing.
      $scope.originalNumOfGroup = $scope.committedWaitingList.length;
      
      $scope.lines = copyWaitingList($scope.committedWaitingList);

      $scope.updateSignUp = function($event, id) {
        var checkbox = $event.target;
        var action = (checkbox.checked ? 'add' : 'remove');

        if (action === 'remove') {
          for (var i=0; i < $scope.lines.length; i++) {
            var index = $scope.lines[i].indexOf(id);
            if (index > -1) {
              $scope.lines[i].splice(index, 1);
              return;
            } 
          }
        }
        //do we allow more than 4 players sign up
        //do we allow merge to last court if not yet played or played less than 10 minutes
        //push to existing only when it is not the original number of group

        if ( ($scope.originalNumOfGroup != $scope.lines.length || $scope.merge.value)
            && $scope.lines.length > 0 && $scope.lines[$scope.lines.length-1].length < 4 ) {
              $scope.lines[$scope.lines.length-1].push(id);
            

        } else {
          $scope.lines.push([ id ]);
        }
        //update($scope.court);
      };

      $scope.hide = function() {
        $mdDialog.hide();
      };

      $scope.cancel = function() {
        $mdDialog.cancel();
      };

      $scope.answer = function(answer) {
        if (answer === 'cancel') {
          $mdDialog.hide(answer);
          return;
        }
        $scope.committedWaitingList.splice(0);
        for (var i=0; i< $scope.lines.length; i++) {
          $scope.committedWaitingList.push($scope.lines[i]);
        }
        
        $scope.court.waitingList = $scope.committedWaitingList;
        $scope.originalNumOfGroup = $scope.committedWaitingList.length;

        //console.log("$scope.court.waitingList "+$scope.court.waitingList);
        //$scope.court.waitingTime = $scope.waitingTime;
        
        // start the timer right away when no one is in the queue
        if ($scope.court.waitingList.length === 1) {
          //$scope.court.countDownTime = 2100;
          $scope.court.countDownValue = 2100;
          $scope.court.countDownTime = $scope.court.countDownValue;          
          parentScope.$broadcast('timer-set-countdown', 2100);
          parentScope.$broadcast('timer-start');
          $scope.court.waitingTime = 35;
          //console.log("resetting timer");
        } else if ($scope.court.waitingList.length === 0) {
          $scope.court.countDownValue = 2100;
          $scope.$broadcast('timer-set-countdown', 2100);
          $scope.$broadcast('timer-start');
        }
        update($scope.court);

        $mdDialog.hide(answer);
      };
    }


    //update();
  };

  function update(crt) {

    //update if the court is open for merging
    //if ($scope.court.countDownTime > 5) {
    //  $scope.court.open = 'closed';
    //} else {
    //  $scope.court.open = 'opened';
    //}
    
    if ($scope.court.waitingList.length ===1 && $scope.court.waitingTime === 0) {
      $scope.court.waitingTime = 35;
      $scope.court.countDownTime = 2100;
      $scope.$broadcast('timer-set-countdown', 2100);
      $scope.$broadcast('timer-start');
    }
    // update groups waiting
    //console.log("update group waitig "+$scope.court.waitingList);
    if ($scope.court.waitingList.length < 2) {
      $scope.court.groupsWaiting = 'No line';
    } else {
      $scope.court.groupsWaiting = ($scope.court.waitingList.length - 1) + ' group(s) waiting';
    }

    // update play time
    if ($scope.court.waitingList.length === 0) {
      $scope.playTime = 'Play now';
    } else if ($scope.court.waitingList.length === 1) {
      $scope.playTime = 'Play next';
    } else {
      $scope.playTime = 'Play in ' + $scope.court.waitingTime + ' min';
    }

    // update button color
    if ($scope.court.waitingList.length === 0) {
      $scope.buttonColor = {
        'background' : 'white',
        'color' : 'db2780'
      };
    } else if ($scope.court.waitingList.length === 1) {
      if ($scope.court.waitingTime < 5) {
        $scope.buttonColor = {
          'background' : '#FFF',
          'color' : '#360710'
        };        
      } else if ($scope.court.waitingTime < 10)  {
        $scope.buttonColor = {
          'background' : '#F8E0E5',
          'color' : '#360710'
        }; 
      } else if ($scope.court.waitingTime < 15)  {
        $scope.buttonColor = {
          'background' : '#F1C1CB',
          'color' : '#360710'
        }; 
      } else if ($scope.court.waitingTime < 20)  {
        $scope.buttonColor = {
          'background' : '#EAA3B1',
          'color' : '#360710'
        }; 
      } else if ($scope.court.waitingTime < 25)  {
        $scope.buttonColor = {
          'background' : '#E28496',
          'color' : '#360710'
        }; 
      } else if ($scope.court.waitingTime < 30)  {
        $scope.buttonColor = {
          'background' : '#DB657C',
          'color' : '#360710'
        }; 
      } else if ($scope.court.waitingTime <= 35)  {
        $scope.buttonColor = {
          'background' : '#D44662',
          'color' : 'white'
        }; 
      } 
    } else if ($scope.court.waitingList.length === 2) {
      $scope.buttonColor = {
        'background' : '#A21531',
        'color' : 'white'
      };
    } else if ($scope.court.waitingList.length === 3) {
      $scope.buttonColor = {
        'background' : '#6C0E21',
        'color' : 'white'
      };
    } else {
      $scope.buttonColor = {
        'background' : '#360710',
        'color' : 'white'
      };
    }

    // display current players when it is more than
    // 10 minutes or there is no next group
    if ($scope.court.countDownTime > 600 && $scope.court.waitingList.length > 0 || $scope.court.waitingList.length == 1) {
      $scope.currentOrNextPlayers = 'Current: ' + $scope.court.waitingList[0].join(', ');
    }
    // display next players when it is < 10 minutes and there is a next group
    else if ($scope.court.countDownTime < 600 && $scope.court.waitingList.length > 1) {
      $scope.currentOrNextPlayers = 'Next: ' + $scope.court.waitingList[1].join(', ');
    }

    if ($scope.court.waitingList.length === 0) {
      $scope.currentOrNextPlayers = '';
    }
    
    var Court = $resource('/api/courts/:id', {id:'@id'});
    
    Court.get({id:$scope.court._id}, function(court) {
      //$scope.court.waitingList = $scope.waitingList;
      //$scope.court.waitingTime = $scope.waitingTime;
      //$scope.court.countDownTime = $scope.countDownTime;
       //console.log("here2 countDownTime " +court.countDownTime);
       //console.log("here2 countDownTime after " +$scope.court.countDownTime);
       //console.log("here21 countDownTime value " +crt.countDownValue); 
      
       if (crt.countDownValue) {
         court.countDownTime = crt.countDownValue;
       } else {
         court.countDownTime = $scope.court.countDownTime;
       }
       //court.countDownTime = 0;
       court.waitingList = $scope.court.waitingList;
       court.waitingTime = $scope.court.waitingTime;
       Courts.update({id:court._id}, court);

    });
  }

  $scope.$on('timer-tick', function(event, args) {

    $timeout(function() {

      var second = Math.round(args.millis / 1000);
      //console.log("seconds "+$scope.court.seconds);
      $scope.timeLeftWidth = {
        'width' : parseInt(second / 60 / 35 * 150, 10) + "px"
      };
      
      // update waiting time
      var timeLeft = Math.round(second / 60);
      
      $scope.court.playTimeLeft = timeLeft + " min";
      if (args.millis === 0) {
        $scope.court.playTimeLeft = "Open";
      } else if ( second < 60)
        $scope.court.playTimeLeft = second + " s";

      $scope.court.countDownTime = Math.round(args.millis / 1000);
      $scope.court.waitingTime =  Math.round($scope.court.countDownTime/60);
      if ($scope.court.waitingList.length > 1)
        $scope.court.waitingTime += 35 * ($scope.court.waitingList.length - 1);

      update($scope.court);

    });

    $scope.callbackTimer = {};
    $scope.callbackTimer.finished = function() {

      // when waiting time becomes
      // 0, remove the current
      // players from the waiting
      // list
      $scope.court.waitingList.shift();

      if ($scope.court.waitingList.length > 0) {
        $scope.$broadcast('timer-set-countdown', 2100);
        $scope.$broadcast('timer-start');
      }
      update($scope.court);
    };

  });
} ]).controller('SignUpDialogController', [ '$scope', '$timeout', '$mdDialog', function($scope, $timeout, $mdDialog) {
} ]).directive('players', function() {
  return {
    template : '{{currentOrNextPlayers1}}'
  };
});
