app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'js/home/home.html',
        controller: 'StatsPage',
        resolve: {
          statistics: function(StatFactory) {
            return StatFactory.getData();
          }
        }
    });
});

app.controller('StatsPage', function($scope, PieChart, statistics) {
  console.log(statistics)
  $scope.percent = statistics[0][0];
  $scope.issues = statistics[1][0];
  $scope.names = statistics[2][0];
  $scope.origins = statistics[3][0];

  console.log($scope.percent);

  PieChart.create($scope.percent);
})