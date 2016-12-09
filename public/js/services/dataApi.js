(function () {
    'use strict';

    angular.module("socialpostal").factory('dataApi', ['$state', '$http', '$q', '$timeout', '$location', '$window', "authToken", "API", dataApi]);
    function dataApi($state, $http, $q, $timeout, $location, $window, authToken, API) {

      function login(){

        var deferred = $q.defer();

            //check for a token in local storage & test it if found
            var authToken = localStorage.getItem("socialPostalToken");

            if (authToken == null || authToken.length < 10) {
                if (localStorage.getItem("socialPostalToken")) localStorage.removeItem("socialPostalToken")
                deferred.reject("Needs login");
                $state.go("home");
            }
            else {
                $http.defaults.headers.common.Authorization = "Bearer " + authToken;
                var url = API + 'checkAuth';
                $http.get(url)
                    .success(function (data) {
                        deferred.resolve();
                    })
                    .error(function () {
                        //console.log("login checkauth error");
                        if (localStorage.getItem("socialPostalToken")) localStorage.removeItem("socialPostalToken")
                        deferred.reject("Login checkAuth failed");
                        $state.go("home");
                    });
            }

        return deferred.promise;
      }

      function checkAuth(){
        var deferred = $q.defer();
          var authToken = localStorage.getItem("socialPostalToken");

          if (authToken == null || authToken.length < 10) {
              if (localStorage.getItem("socialPostalToken")) localStorage.removeItem("socialPostalToken")
              deferred.reject("No Credentials");
          }
          else {
              $http.defaults.headers.common.Authorization = "Bearer " + authToken;
              var url = API + 'checkAuth';
              $http.get(url)
                  .success(function (data) {
                      deferred.resolve(data);
                  })
                  .error(function () {
                      //console.log("login checkauth error");
                      if (localStorage.getItem("socialPostalToken")) localStorage.removeItem("socialPostalToken")
                      deferred.reject("Error with getting user");
                  });
          }

        return deferred.promise
      }

      function registerUser(user){
        var deferred = $q.defer();
        var d = angular.toJson(user);
        var url = API + 'register';
        $http({
          method: "POST",
          url: url,
          data: d,
          headers: { 'Content-Type': 'application/json'}
        })
            .success(function(data) {
              authToken.setToken(data.token)
              deferred.resolve(data)
            })
           .error(function (data, status, headers, config) {
               deferred.reject(data);
           });
        return deferred.promise
      }

      function loginUser(user){
        var deferred = $q.defer();
        var d = angular.toJson(user);
        var url = API + "login";
        $http({
          method: "POST",
          url: url,
          data: d,
          headers: { 'Content-Type': 'application/json'}
        })
            .success(function(data) {
              authToken.setToken(data.token)
              deferred.resolve(data)
            })
           .error(function (data, status, headers, config) {
               deferred.reject(data);
           });
        return deferred.promise
      }

      function getNewUser(){
        var deferred = $q.defer();
        var url = API + "newUser"
        $http.get(url)
            .success(function (data) {
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                deferred.reject(data);
            });
          return deferred.promise
      }

      function getUser(){
        var deferred = $q.defer();
        login().then(function(){
          var url = API + "user"
          $http.get(url)
            .success(function (data) {
                deferred.resolve(data);
            })
            .error(function (err) {
                deferred.reject(err);
            });
        }, function(reason){
          deferred.reject(reason);
        });
        return deferred.promise
      }

      function getUsers(){
        var deferred = $q.defer();
        var url = API + "users"
        $http.get(url)
          .success(function (data) {
              deferred.resolve(data);
          })
          .error(function (data, status, headers, config) {
              deferred.reject();
          });
        return deferred.promise
      }

      // function getLeague(id){
      //   var deferred = $q.defer();
      //   var url = "http://localhost:3000/api/league"
      //   if(id) url += ("?id=" + id)
      //   $http.get(url)
      //       .success(function (data) {
      //           deferred.resolve(data);
      //       })
      //       .error(function (data, status, headers, config) {
      //           deferred.reject();
      //       });
      //     return deferred.promise
      // }

      // function getLeagues(){
      //   var deferred = $q.defer();
      //   var url = "http://localhost:3000/api/leagues"
      //   $http.get(url)
      //       .success(function (data) {
      //           deferred.resolve(data);
      //       })
      //       .error(function (data, status, headers, config) {
      //           deferred.reject();
      //       });
      //     return deferred.promise
      // }


      return {
        checkAuth: checkAuth,
        registerUser: registerUser,
        loginUser: loginUser,
        getUsers: getUsers,
        getNewUser: getNewUser,
        getUser: getUser,
      }
    }
})()
