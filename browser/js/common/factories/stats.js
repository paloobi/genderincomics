app.factory('StatFactory', function($http, $q) {

  var Stats = {};

  Stats.getData = function(){
    
    var percent = $http.get('/api/stats/percent').then(function(res) { return res.data; })
    var issues = $http.get('/api/stats/issues').then(function(res) { return res.data; })
    var names = $http.get('/api/stats/names').then(function(res) { return res.data; })
    var origins = $http.get('/api/stats/origins').then(function(res) { return res.data; })

    return $q.all([percent, issues, names, origins]);
  }

  return Stats;

});