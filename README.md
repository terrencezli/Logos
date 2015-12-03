# **Logos**

## Synopsis

This project accepts user input as command line arguments and returns the 
most common characteristics of logos in the specified industry. [Host
Repository](https://github.com/terrencezli/Logos).

**List of accepted industries**

41   -   Banking

118  -   Computer Network & Security

28   -   Entertainment

32   -   Restaurants

27   -   Retail

## Sample Run
In your browser, enter the url with your own parameters for industry
and size.

**162.243.144.203:8080/api/tag/icon**

*Here is a sample run looking up companies within the entertainment
industry (28) with an employee count of 51-400*

162.243.144.203:8080/api/tag/icon?industry=28&companySize=51-400

{}


The returned values are keywords and their associated confidence
for their relevance within companies that fit the entered parameters.
In this case, a company size of 51-400 employees within the
"Alternative Medicine" industry.

**Having 1, 2, and 3 are the most common occurences**

## Motivation

The motivation behind this project is to provide information on the
most common characteristics of logos in the user-specified industry.
We hope that our results will provide helpful feedback to inspire
the user on some characteristics to incorporate into their logo
creations; this may be used for research on logo analysis as well.

## Code Example
*Here is a sample snippet of code similar to what our program is
executing*


var MongoClient = require('mongodb').MongoClient;
 
Imagga.prototype.tag = function tag(url, callback) {
   
   MongoClient.connect(mongoURL, function(err, db) {
      
      if (err) {
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

##Future Versions

Here is the list of all the industry codes that LinkedIn offers. In
future implementations we will add more industries to be supported.
The only limitation as to why we are limiting industries is the size
of our database.

It is/will be necessary to match spelling and capitalization for this program
to work. [Entire List of
Codes](https://developer.linkedin.com/docs/reference/industry-codes).
