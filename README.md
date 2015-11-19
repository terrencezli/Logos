# **Logos**

## Synopsis

This project accepts user input as command line arguments and returns the most common characteristics of logos in the specified industry. [Host
Repository](https://github.com/terrencezli/Logos); 

## Sample Run

node somefile.js industry-name

For companies in this industry, the most common colors in logos... 
1. colorA 
2. colorB 
3. colorC

For companies in this industry, the most common keywords associated
with their logos...
1. Attribute1
2. Attribute2
3. Attribute3

## Motivation

The motivation behind this project is to provide information on the
most common characteristics of logos in the user-specified industry.
We hope that our results will provide helpful feedback to inspire
the user on some characteristics to incorporate into their logo
creations; this may be used for research on logo analysis as well.

## Code Example

var MongoClient = require('mongodb').MongoClient;
 
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

## Contributors

Aaron Pramana, Kevin Costello, Terrence Li, Timothy Chu


