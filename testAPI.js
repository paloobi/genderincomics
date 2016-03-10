// var http = require('http');
var request = require('request');
var fs = require('fs');

// http.request({
//   hostname: 'comicvine.gamespot.com',
//   port: 80,
//   path: '',
//   method: 'GET'
//   }, function(res) {
//     console.log(res)
//     res.on('data', (chunk) => {
//       console.log(`BODY: ${chunk}`);
//     });
//     // fs.writeFile('API_DATA.txt', data.toString());
//   })

request({
    url: 'http://comicvine.gamespot.com/api/characters/?api_key=48f39272e4a344376bf34fb0659c0d97e82205aa&format=json&limit=1&filter=gender:female',
    headers: {
      'User-Agent': 'paloobi'
    }
  }, 
  function (error, response, body) {
    if (error) throw error;
    // console.log(response);
    if (!error && response.statusCode == 200) {
      fs.writeFile('API_DATA.json', body);
    }
})