  'use strict';

    angular.module("socialpostal").factory('authToken', function authToken($window) {
      var storage = $window.localStorage;
      var cachedToken;
      var socialPostalToken = 'socialPostalToken';
      var newToken = {
            setToken: function(token){
              cachedToken = token;
              storage.setItem(socialPostalToken, token);
            },
            getToken: function(){
              if(!cachedToken){
                cachedToken = storage.getItem(socialPostalToken);
              }
                return cachedToken
            },
            isAuthenticated: function(){
              return !!newToken.getToken()
            },
            removeToken: function(){
              cachedToken = null;
              storage.removeItem(socialPostalToken)
            }
          }

      return newToken;

  });
