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
  $scope.percent = statistics[0];
  $scope.issues = statistics[1];
  $scope.names = statistics[2];
  $scope.origins = statistics[3];

  PieChart.create($scope.percent);
})