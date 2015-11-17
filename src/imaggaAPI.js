var unirest = require("unirest");
var assert = require('assert');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var AUTHORIZATION = "Basic YWNjXzE5ZmIzNzU1YzQ1M2I3ZjplMDg5ZjIyNGM1ZWE4MWVlZjY1MDZjYWI5OTIxOTA1OA==";
var argvURL = process.argv.slice(2);
var mongoURL = 'mongodb://pogomylogo:pogo1234pogo@162.243.144.203:27017/pogomylogo';

function Imagga() {
};

//Find urls in DB (put by LinkedIn API)
var findURL = function(db, callback) {
   var cursor = db.collection('companies-test').find();
   //var counter = 0;
   cursor.each(function(err, doc) {
      if (doc != null) {
         //console.log(counter++);
         var temp = {
            name: doc.name,
            logoUrl: doc.logoUrl
         };
         console.log('temp:' + temp);   
         console.log('docname: ' + doc.name);
         console.log('doclogourl: ' + doc.logoUrl);

         //put into database
         db.collection('logos').insertOne(temp, function(err, result) {
            console.log('err:' + err);
            //assert.equals(err, null);
            if(err != null) 
               console.log("Completed insertion of 1 company");
         });
      }
      else {
         //console.log('Closing DB');
         callback();
      }
   });
};

Imagga.prototype.tag = function tag(url, callback) {
   MongoClient.connect(mongoURL, function(err, db) {
      if(err) {
         console.log(err);
      }
      else {
         assert.equal(null, err);
         console.log("Connected correctly to server.");
         findURL(db, function(doc) {
            db.close();
         });
         
      }
   });


   var tagReq = unirest("GET", "http://api.imagga.com/v1/tagging");

   tagReq.query({
      "url": url,
      "version": "2"
   });

   tagReq.headers({
      "authorization": AUTHORIZATION, 
      "accept": "application/json"
   });

   tagReq.end(function (res) {
      if (res.error) throw new Error(res.error);
      var data = res.body;
      var tagsdata = data['results'][0]['tags'];
      for (var i = 0; i < tagsdata.length; i++) {
         //console.log(tagsdata[i]['tag']);
      }

   });
};

Imagga.prototype.color = function color() {
   var colorReq = unirest("GET", "http://api.imagga.com/v1/colors");

   colorReq.query({
      //"url": url,
      "version": "2"
   });

   colorReq.headers({
      "authorization": AUTHORIZATION,
      "accept": "application/json"
   });

   colorReq.end(function (res) {
      if (res.error) throw new Error(res.error);
      var data = res.body;
      console.log(JSON.stringify(data));
   });
};

var test = new Imagga();
test.tag(argvURL);
//test.color();

module.exports.imagga = Imagga;
