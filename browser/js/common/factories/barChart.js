app.factory('BarChart', function(){

  var chart = {};

  chart.create = function(data) {
    new Chartist.Bar('#issues', {
      labels: ["Female", "Male", "Other"],
      series: [[data.female, data.male, data.other]]
    });
  }
      
  return chart;
  
})