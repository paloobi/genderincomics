app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'js/home/home.html',
        controller: 'Home',
        params: {
          autoActivateChild: 'parentState.childState'
        }
    })
    .state('home.statsSection', {
      url: '',
      templateUrl: 'js/home/stats.html',
      controller: 'StatsPage',
      resolve: {
        statistics: function(StatFactory) {
          return StatFactory.getData();
        }
      }
    });
});


app.controller('Home', function($scope, $rootScope, $state) {
  $scope.loading = true;

  $rootScope.$on('$stateChangeSuccess', function(event){
    $scope.loading = false;
  });
  
  $state.go('home.statsSection');

})

app.controller('StatsPage', function($scope, PieChart, BarChart, statistics) {

  var percentStats = statistics[0],
    issueStats = statistics[1],
    nameStats = statistics[2],
    originStats = statistics[3];

  $scope.publisher = "overall";

  $scope.percent = _.find(percentStats, {publisher: $scope.publisher});
  $scope.issues = _.find(issueStats, {publisher: $scope.publisher});
  $scope.origins = _.find(originStats, {publisher: $scope.publisher});
  $scope.names = _.find(nameStats, {publisher: $scope.publisher});

  console.log($scope.percent);
  console.log($scope.issues);
  console.log($scope.origins);
  console.log($scope.names);

  PieChart.create($scope.percent);
  BarChart.create($scope.issues);
  
})