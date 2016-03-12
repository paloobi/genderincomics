app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'js/home/home.html',
        controller: 'StatsPage',
        resolve: {
          characters: function(StatFactory) {
            return StatFactory.getCharacters() 
          }
        }
    });
});

app.controller('StatsPage', function($scope, characters, PieChart) {
    var stats = {}
    characters.forEach(function(character) {
      if (!stats[character.gender]) stats[character.gender] = 0;
      stats[character.gender]++;
    })
    PieChart.create(stats);
})