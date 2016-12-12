(function(){
  'use strict';

  angular.module("socialpostal").controller('HomeCtrl', ['$rootScope', '$window', '$scope', '$state', 'authInterceptor', 'authToken', 'dataApi', HomeCtrl]);

  function HomeCtrl($rootScope, $window, $scope, $state, authInterceptor, authToken, dataApi) {
      var vm = this;
      document.title = "Social Postal";

    angular.element($window).on('resize', function () {
      $scope.$apply(function () {
        vm.height = window.innerHeight + 'px';
      });
    });

    vm.loadPage = function(){
        dataApi.getNewUser().then(function(data){
          vm.user = data;
          // console.log(vm.user);
        }, function(err){
          console.log(err);
        });
        vm.height = window.innerHeight + 'px';
    };


    vm.signUp = function(user){
      console.log(user);
      dataApi.registerUser(user).then(function(data){
        if(data.success){
          $state.go('user', {register: true});
        }
      }, function(err){
        vm.user.password = '';
        vm.user.passwordconfirm = '';
        console.log(err);
      })
    };

    vm.signIn = function(user){
      dataApi.loginUser(user).then(function(data){
        if(data.success){
          $state.go('user');
        }
      }, function(err){
        vm.user.password = '';
        console.log(err);
      })
    }

    vm.loadPage();

  };
})();
