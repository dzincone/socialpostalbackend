  'use strict';

    angular.module("socialpostal").service('alert', function alert($rootScope, $timeout) {
      var alertTimeout;
      return function(type, title, message, timeout){
        $rootScope.alert = {
          hasBeenShown: true,
          show: true,
          type: type,
          message: message,
          title: title
        };
        $timeout.cancel(alertTimeout);
        alertTimeout = $timeout(function(){
          $rootScope.alert.show = false;
          $timeout(function(){
            $rootScope.alert.hasBeenShown = false;
          }, 600)
        }, timeout || 3000)
      }
  });
