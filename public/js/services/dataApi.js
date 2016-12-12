(function () {
    'use strict';

    angular.module("socialpostal").factory('dataApi', ['$state', '$http', '$q', '$timeout', '$location', '$window', 'alert', "authToken", "API", dataApi]);
    function dataApi($state, $http, $q, $timeout, $location, $window, alert, authToken, API) {

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
               var message = alert('danger', 'Uh Oh', data.message)
               deferred.reject(message);
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
              var message = alert('success', 'Welcome Back', 'Glad you can make it back. Post away!')
              deferred.resolve(data, message)
            })
           .error(function (data, status, headers, config) {
               var message = alert('danger', 'Uh Oh', data.message)
               deferred.reject(message);
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

      function signOutMedia(media){
        var deferred = $q.defer();
        login().then(function(){
          var url = API + 'signOutMedia';
          var d = angular.toJson({media: media});
          $http({
            method: "POST",
            url: url,
            data: d,
            headers: { 'Content-Type': 'application/json'}
          })
              .success(function(data) {
                var message = alert('warning', 'Bye Bye', 'You have signed out of ' + media)
                deferred.resolve(data, message)
              })
             .error(function (data, status, headers, config) {
                 deferred.reject(data);
             });
        })
        return deferred.promise;
      }

      function postMedia(user){
        var deferred = $q.defer();

        login().then(function(){
          var url = API + 'postMedia';
          var d = angular.toJson(user);
          $http({
            method: 'POST',
            url: url,
            data: d,
            headers: {'Content-Type': 'application/json'}
          })
              .success(function(data){
                var message = alert('success', 'Congrats', 'Your post was sent successfully!')
                deferred.resolve(data, message);
              })
              .error(function(data, status, headers, config){
                
                deferred.reject(data);
              });
        });

        return deferred. promise;
      }


      return {
        checkAuth: checkAuth,
        registerUser: registerUser,
        loginUser: loginUser,
        getUsers: getUsers,
        getNewUser: getNewUser,
        getUser: getUser,
        signOutMedia: signOutMedia,
        postMedia: postMedia
      }
    }
})()
