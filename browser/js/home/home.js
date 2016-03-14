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
      url: '/',
      templateUrl: 'js/home/stats.html',
      controller: 'StatsPage',
      resolve: {
        statistics: function(StatFactory) {
          return StatFactory.getData();
        }
      }
    });
});

app.factory('Publisher', function($location){

  var publisher = {};

  var currentPublisher = 'overall';

  publisher.getCurrent = function() {
    return $location.search().length ? $location.search.publisher : 'overall';
  }

  return publisher;
})

app.controller('Home', function($scope, $rootScope, $state, $location, Publisher) {
  
  if ($scope.loading === undefined) $scope.loading = true;

  $rootScope.$on('$stateChangeSuccess', function(event){
    $scope.loading = false;
  });
  
  $state.go('home.statsSection');

})

app.controller('StatsPage', function($scope, PieChart, BarChart, statistics, $location, Publisher) {

  var percentStats = statistics[0],
    issueStats = statistics[1],
    nameStats = statistics[2],
    originStats = statistics[3];

  $scope.publisher = Publisher.getCurrent();

  // set publisher from URI query strings if any
  if ($location.search().length) {
    if ($location.search().publisher) {
      $scope.publisher = decodeURI($location.search().publisher);
    }
  } else {
    $scope.publisher = "overall";
  }

  $scope.toggleFilter = function(value) {
    if (value === 'overall') $location.search('publisher', null);
    if ($location.search().publisher === encodeURI(value) ) {
      $location.search('publisher', null);
      $scope.publisher = 'overall';
    } else {
      $location.search('publisher', encodeURI(value) );
      $scope.publisher = value;
    }
    $scope.percent = _.find(percentStats, {publisher: $scope.publisher});
    $scope.issues = _.find(issueStats, {publisher: $scope.publisher});
    $scope.origins = _.find(originStats, {publisher: $scope.publisher});
    $scope.names = _.find(nameStats, {publisher: $scope.publisher});
    console.log($scope.names);
    PieChart.create($scope.percent);
    BarChart.create($scope.issues);
  }

  $scope.percent = _.find(percentStats, {publisher: $scope.publisher});
  $scope.issues = _.find(issueStats, {publisher: $scope.publisher});
  $scope.origins = _.find(originStats, {publisher: $scope.publisher});
  $scope.names = _.find(nameStats, {publisher: $scope.publisher});

  console.log($scope.origins);
  console.log($scope.names);

  PieChart.create($scope.percent);
  BarChart.create($scope.issues);
  
})