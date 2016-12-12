(function () {
    'use strict';

    angular.module("socialpostal").directive('userHeader', ['authToken', '$state', 'alert',
        function (authToken, $state, alert) {
            return {
                restrict: "E",
                scope: {
                    user: '=',

                },
                templateUrl: "templates/directives/userHeader.html",
                link: function (scope, elem, attrs) {

          var watcherUser = scope.$watch('user', function () {
              if (scope.user === undefined) return;
              assignUI();
          });

          scope.signOut = function(){
            authToken.removeToken();
            alert('warning', 'Bye Friend', 'Hope to see you again!')
            $state.go('home');
          };

          function assignUI(){

          };

        }
      }
  }]);

})();
