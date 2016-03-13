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

app.controller('StatsPage', function($scope, PieChart, BarChart, statistics) {
  var percentStats = statistics[0],
    issueStats = statistics[1],
    nameStats = statistics[2],
    originStats = statistics[3];

  $scope.publisher = "overall";

  $scope.percent = _.find(percentStats, {publisher: 'DC Comics'});
  $scope.issues = _.find(issueStats, {publisher: 'London Editions Magazines'});
  $scope.names = _.find(nameStats, {publisher: 'overall'});
  $scope.origins = _.find(originStats, {publisher: 'overall'});

  // console.log($scope.percent);

  // console.log($scope.issues);
  PieChart.create($scope.percent);
  BarChart.create($scope.issues);
})