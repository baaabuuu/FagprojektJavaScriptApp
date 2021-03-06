// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {


    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
    ble.isEnabled(
      function(){
        // Bluetooth is enabled
      },
      function(){
        // Bluetooth not yet enabled so we try to enable it
        ble.enable(
          function(){
            // bluetooth now enabled
          },
          function(err){
            alert('Cannot enable bluetooth');
          }
        );
      }
    );
  });
})
.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('home', {
    url: '/home',
    templateUrl: 'templates/home.html'
  })

  .state('device', {
    url: '/device/:id',
    templateUrl: 'templates/device.html'
  })
  .state('buttons', {
    url: '/buttons/:id',
    templateUrl: 'templates/buttons.html'
  })
  ;

  $urlRouterProvider.otherwise('/home');
});
