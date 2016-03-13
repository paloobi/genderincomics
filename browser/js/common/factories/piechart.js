app.factory('PieChart', function(){

  var chart = {};

  chart.create = function(data) { 

    new Chartist.Pie('#percent', {
      series: [{
        value: data.female,
        name: 'Female',
        className: 'femalePercent'
      }, {
        value: data.male,
        name: 'Male',
        className: 'malePercent'
      }, {
        value: data.other,
        name: 'Other/Not Specified',
        className: 'otherPercent'
      }]
    });

  }

  return chart;

});
