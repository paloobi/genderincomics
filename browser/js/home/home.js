app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'js/home/home.html',
        controller: 'StatsPage'
    });
});

app.controller('StatsPage', function($scope) {
  $scope.availableStats = [
    "total"
  ]
})