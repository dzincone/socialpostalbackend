(function(){
  'use strict';

  angular.module('socialpostal').controller('UserCtrl', ['$rootScope', '$window', '$scope', '$stateParams', '$state', 'alert', 'authInterceptor', 'authToken', 'dataApi', 'API', UserCtrl]);

  function UserCtrl($rootScope, $window, $scope, $stateParams, $state, alert, authInterceptor, authToken, dataApi, API){
    var vm = this;


    vm.loadPage = function(){
      dataApi.getUser().then(function(user){
        vm.user = user;
        if($stateParams.register){
          vm.newUser = true;
        }
      }, function(err){
        $state.go('home');
      });
    };

    vm.signInMedia = function(media){
      switch(media){
        case 'twitter':
          var twitterWindow = $window.open(API + 'auth/twitter?id=' + vm.user._id);
          var counter = 0;
          var timer = setInterval(checkTwitterCreds, 1000);
          break;
        case 'linkedin':
          var linkedinWindow = $window.open(API + 'auth/linkedin?id=' + vm.user._id);
          var counter = 0;
          var timer = setInterval(checkLinkedinCreds, 1000);
          break;
        case 'facebook':
          var facebookWindow = $window.open(API + 'auth/facebook?id=' + vm.user._id);
          var counter = 0;
          var timer = setInterval(checkFacebookCreds, 1000);
          break;
      }
      function checkLinkedinCreds(){
        dataApi.getUser().then(function(user){
          if(user.linkedinCreds){
            vm.user.linkedinCreds = user.linkedinCreds;
            alert('success', 'Awesome', 'You have logged into Linkedin')
            linkedinWindow.close();
            clearInterval(timer);
          } else {
            counter++;
            if(counter == 60){
              linkedinWindow.close();
              alert('danger', 'Bad News', 'There was an issue logging into Linkedin')
              clearInterval(timer);
            }
          }
        })
      };

      function checkFacebookCreds(){
        dataApi.getUser().then(function(user){
          if(user.facebookCreds){
            vm.user.facebookCreds = user.facebookCreds;
            alert('success', 'Awesome', 'You have logged into Facebook')
            facebookWindow.close();
            clearInterval(timer);
          } else {
            counter++;
            if(counter == 60){
              alert('danger', 'Bad News', 'There was an issue logging into Facebook')
              facebookWindow.close();
              clearInterval(timer);
            }
          }
        })
      };

      function checkTwitterCreds(){
        dataApi.getUser().then(function(user){
          if(user.twitterCreds){
            vm.user.twitterCreds = user.twitterCreds;
            alert('success', 'Awesome', 'You have logged into Twitter')
            twitterWindow.close();
            clearInterval(timer);
          } else {
            counter++;
            if(counter == 60){
              alert('danger', 'Bad News', 'There was an issue logging into Twitter')
              twitterWindow.close();
              clearInterval(timer);
            }
          }
        })
      };
    };

    vm.signOutMedia = function(media){
      dataApi.signOutMedia(media).then(function(user){
        switch(media){
          case 'twitter':
            vm.user.twitterCreds = user.twitterCreds;
            break;
          case 'linkedin':
            vm.user.linkedinCreds = user.linkedinCreds;
            break;
          case 'facebook':
            vm.user.facebookCreds = user.facebookCreds;
            break;
        }
      })
    };

    vm.postNow = function(){
      dataApi.postMedia(vm.user).then(function(post){

      }, function(err){

      })
    }

    vm.loadPage();
  };
})();
