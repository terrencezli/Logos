var unirest = require("unirest");
var AUTHORIZATION = "Basic YWNjXzE5ZmIzNzU1YzQ1M2I3ZjplMDg5ZjIyNGM1ZWE4MWVlZjY1MDZjYWI5OTIxOTA1OA==";
var argvUrl = process.argv.slice(2);

function Imagga() {
};

Imagga.prototype.tag = function tag(url, callback) {
   var tagreq = unirest("GET", "http://api.imagga.com/v1/tagging");

   tagreq.query({
      "url": url,
      "version": "2"
   });

   tagreq.headers({
      "authorization": AUTHORIZATION, 
      "accept": "application/json"
   });

   tagreq.end(function (res) {
      if (res.error) throw new Error(res.error);
      var data = res.body;
      var tagsdata = data['results'][0]['tags'];
      for (var i = 0; i < tagsdata.length; i++) {
         console.log(tagsdata[i]['tag']);
      }
   });
};

Imagga.prototype.color = function color(url) {
   var colorreq = unirest("GET", "http://api.imagga.com/v1/colors");

   colorreq.query({
      "url": url,
      "version": "2"
   });

   colorreq.headers({
      "authorization": AUTHORIZATION,
      "accept": "application/json"
   });

   colorreq.end(function (res) {
      if (res.error) throw new Error(res.error);
      var data = res.body;
      console.log(JSON.stringify(data));
   });
};

var test = new Imagga();
test.tag(argvUrl);
test.color(argvUrl);

module.exports.magga = Imagga;
