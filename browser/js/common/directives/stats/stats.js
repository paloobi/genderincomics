app.factory('StatFactory', function($http) {

  var Stats = {};

  Stats.getStats = function(title) {
    console.log(title);
    return $http.get('/api/stats/' + title)
      .then(function(res) {
        return res.data; 
      });
  }
  return Stats;

});

app.directive('stats', function(StatFactory, PieChart) {
  return {
    restrict: 'E',
    templateUrl: 'js/common/directives/stats/stats.html',
    scope: {
      title: "@"
    },
    link: function(scope) {
      scope.stats = {};
      StatFactory.getStats(scope.title)
      .then(function(stats){
        // console.log(stats);
        scope.stats[scope.title] = stats;
        PieChart.create(stats);
        scope.$digest();
      })
    }
  }
});
