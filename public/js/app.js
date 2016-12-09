var app = angular.module("socialpostal", ['ui.router', 'ui.bootstrap'])

    .config(function ($stateProvider, $urlRouterProvider, $httpProvider, $locationProvider) {
        $stateProvider
            .state('home', { url: "/", templateUrl: "templates/home/home.html" })
            .state('user', { url: "/user", params: {register: false}, templateUrl: "templates/users/user.html" })
            ;

        $urlRouterProvider.otherwise('/');

        $locationProvider.html5Mode(true);
        
        $httpProvider.interceptors.push('authInterceptor')


    })

  .constant('API', 'http://localhost:3000/api/')

  .run(function ($state) {
      $state.go('home');
  });

  function InitializeTheApp() {
    angular.bootstrap(document, ["socialpostal"]);
}
