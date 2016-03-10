app.factory('PieChart', function(){

  function getData(stats) {
    var data = [];
    var color;

    for (var stat in stats) {

      if (stat ==='female' || stat === 'male' || stat === 'other') {
        data.push({
          "label": stat,
          "value": stats[stat],
          "color": colors[stat]
        })
      }
    }
    return data;
  }


  var colors = {
    female: "#00ff00",
    male: "#ff0000",
    other: "#0000ff"
  }

  return {
    create: function(stats) {

      nv.addGraph(function() {

        var chart = nv.models.pieChart()
            .x(function(d) { return d.label })
            .y(function(d) { return d.value })
            .labelType(function(d, i, values) {
              return values.value;
            })
            .showLabels(true);

        d3.select("#overall svg")
              .datum(getData(stats))
              .transition().duration(350)
              .call(chart);

        return chart;

      });

    }
  }

});
