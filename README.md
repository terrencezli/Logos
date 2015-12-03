# **Logos**

## Synopsis

This project accepts user input as command line arguments and returns the 
most common characteristics of logos for companies that satisfy the
specified parameters. [Host
Repository](https://github.com/terrencezli/Logos).

**List of accepted industries**

118  -   Computer Network & Security

28   -   Entertainment

27   -   Retail

## Sample Run
In your browser, enter the following url with your own parameters for industry
and size.

**http://162.243.144.203:8080/api/suggestion/**

*Here is a sample run looking up companies within the entertainment
industry (28) with an employee count of 51-400*

**http://162.243.144.203:8080/api/suggestion?industry=28&companySize=51-400**

{
   "color":"#FF0000",
   "numColors":3,
   "tags": ["sun", "bright", "ocean"]
}


The returned values are keywords and their associated confidence
for their relevance within companies that fit the entered parameters.
Along with the most common color and  number of colors within the
logos analyzed.
In this case, a company size of 51-400 employees within the
"Entertainment" industry.

**Having sun, bright, and ocean are the most common logo feature occurences, with 
3 colors and the most common color of #FF0000**

You can also find tags that are associated with a given tag of water if you
please. By running:
**http://162.243.144.203:8080/api/tag/symbol**

A list of tags will be returned. The list shows that the most common
occurences and best matches with the water tag are the tags "sky",
"clouds", "signboard", and "worm".


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

##Future Versions

[Here](https://developer.linkedin.com/docs/reference/industry-codes)
is the list of all the industry codes that LinkedIn offers. In
future implementations we will add more industries to be supported.
The only limitation as to why we are limiting industries is the size
of our database.

It is/will be necessary to match spelling and capitalization for this program
to work.

## Contributors

Aaron Pramana, Kevin Costello, Terrence Li, Timothy Chu
