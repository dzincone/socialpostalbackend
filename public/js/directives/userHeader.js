(function () {
    'use strict';

    angular.module("socialpostal").directive('userHeader', ['authToken', '$state',
        function (authToken, $state) {
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
            $state.go('home');
          };

          function assignUI(){

          };

        }
      }
  }]);

})();
