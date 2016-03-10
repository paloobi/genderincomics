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

app.directive('stats', function(StatFactory) {
  return {
    restrict: 'E',
    templateUrl: 'js/common/directives/stats/stats.html',
    scope: {},
    link: function(scope) {
      scope.stats = {};
      StatFactory.getOverall().then(function(stats){
        scope.stats.overall = stats;
        makePieChart(stats);
      })
    }
  }
});

function makePieChart(stats) {

  function getData(stats) {
    var data = [];

    for (var stat in stats) {
      if (['female', 'male', 'other'].indexOf(stat) > -1) {
        data.push({
          "label": stat,
          "value": stats[stat]
        })
      }
    }
    return data;
  }

  var height = 600;
  var width = 600;

  nv.addGraph(function() {

    var chart = nv.models.pieChart()
        .x(function(d) { return d.label })
        .y(function(d) { return d.value })
        .width(width)
        .height(height)

    d3.select("#overall")
          .datum(getData(stats))
          .transition().duration(350)
          .call(chart);

    return chart;
  });

}