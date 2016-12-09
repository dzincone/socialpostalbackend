(function(){
  'use strict';

  angular.module("socialpostal").controller('HomeCtrl', ['$rootScope', '$window', '$scope', '$state', 'authInterceptor', 'authToken', 'dataApi', HomeCtrl]);

  function HomeCtrl($rootScope, $window, $scope, $state, authInterceptor, authToken, dataApi) {
      var vm = this;
      document.title = "Social Postal";
      console.log('hello');

    angular.element($window).on('resize', function () {
      $scope.$apply(function () {
        vm.height = window.innerHeight + 'px';
      });
    });

    vm.loadPage = function(){
      dataApi.getNewUser().then(function(data){
        vm.user = data;
        console.log(vm.user);
      });
      vm.height = window.innerHeight + 'px';
    };


    vm.signUp = function(user){
      console.log(user);
      dataApi.registerUser(user).then(function(data){
        if(data.success){
          console.log('has message');
          $state.go('user', {register: true});
        }
        console.log('completed');
        console.log(data);
      }, function(err){
        console.log('had some trouble here');
      })
    };

    vm.loadPage();

  };
})();
