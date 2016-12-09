(function(){
  'use strict';

  angular.module('socialpostal').controller('UserCtrl', ['$rootScope', '$window', '$scope', '$stateParams', '$state', 'authInterceptor', 'authToken', 'dataApi', UserCtrl]);

  function UserCtrl($rootScope, $window, $scope, $stateParams, $state, authInterceptor, authToken, dataApi){
    var vm = this;


    vm.loadPage = function(){
      console.log('inside user controller');
      console.log($stateParams);
      dataApi.getUser().then(function(user){
        console.log(user);
        if($stateParams.register){
          vm.newUser = true;
        }
      }, function(err){
        console.log(err);
        $state.go('home');
      });
    };

    vm.logout = function(){
      authToken.removeToken();
      $state.go('home');
    }

    vm.loadPage();
  };
})();
