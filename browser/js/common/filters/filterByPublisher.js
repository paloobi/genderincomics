app.filter('byPublisher', function() {
  return function(input) {
    return input.filter(function(val) {
      return val.publisher === $scope.publisher;
    });
  }
})