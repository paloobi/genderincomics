app.factory('StatFactory', function($http) {

  var Stats = {};

  Stats.getCharacters = function(){
    return $http.get('/api/stats')
      .then(function(res) {
        return res.data;
      })
  }
  return Stats;

});

// app.directive('stats', function(StatFactory, PieChart) {
//   return {
//     restrict: 'E',
//     templateUrl: 'js/common/directives/stats/stats.html',
//     scope: {
//       title: "@"
//     },
//     link: function(scope) {

//     }
//   }
// });
