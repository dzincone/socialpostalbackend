var app = angular.module("socialpostal", ['ui.router', 'ui.bootstrap'])

    .config(function ($stateProvider, $urlRouterProvider, $httpProvider, $locationProvider) {
        $stateProvider
            .state('home', { url: "/", templateUrl: "templates/home/home.html" })
            .state('user', { url: "/user", params: {register: false}, templateUrl: "templates/users/user.html" })
            .state('success', { url: "/success", templateUrl: "templates/home/success.html" })
            ;

        $urlRouterProvider.otherwise('/');

        $locationProvider.html5Mode(true);

        $httpProvider.interceptors.push('authInterceptor')


    })

  .constant('API', 'https://murmuring-escarpment-65033.herokuapp.com/api/')

  .run(function ($state, $rootScope, $window, dataApi) {
    var success = false;
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
      if (toState.name === 'success'){
        return;
      } else {
        dataApi.checkAuth().then(function(auth){
          if(auth){
            $state.go('user');
          } else {
            console.log('uh oh');
          }
        }, function(err){
            return;
        })
      }
    });
    // if(!success){
    //
    // } else {
    //   $state.go('success');
    // }
  });

  function InitializeTheApp() {
    angular.bootstrap(document, ["socialpostal"]);
}
