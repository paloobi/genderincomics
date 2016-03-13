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

  console.log('this controller isn\'t loading');

  var percentStats = statistics[0],
    issueStats = statistics[1],
    nameStats = statistics[2],
    originStats = statistics[3];

  $scope.publisher = "overall";

  $scope.percent = _.find(percentStats, {publisher: 'overall'});
  $scope.issues = _.find(issueStats, {publisher: 'overall'});
  $scope.origins = _.find(originStats, {publisher: 'overall'});

  // console.log($scope.percent);

  // console.log($scope.issues);
  PieChart.create($scope.percent);
  BarChart.create($scope.issues);
  
})