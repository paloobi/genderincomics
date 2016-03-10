app.factory('StatFactory', function($http) {

  var Stats = {};

  Stats.getOverall = function() {
    return $http.get('/api/stats/overall')
      .then(function(res) {
        return res.data; 
      });
  }
  return Stats;

})

app.directive('stats', function(StatFactory, PieChart) {
  return {
    restrict: 'E',
    templateUrl: 'js/common/directives/stats/stats.html',
    scope: {},
    link: function(scope) {
      scope.stats = {};
      StatFactory.getOverall().then(function(stats){
        scope.stats.overall = stats;
        PieChart.create(stats);
      })
    }
  }
});
