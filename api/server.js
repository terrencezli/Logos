// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');
var bodyParser = require('body-parser');
var app        = express();
var morgan     = require('morgan');

var MongoClient = require('mongodb').MongoClient;
var correlate = require('../src/correlateAPI');

// configure app
app.use(morgan('dev')); // log requests to the console

// configure body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port     = process.env.PORT || 8080; // set our port

var mongoose   = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/pogomylogo'); // connect to our database
var Bear     = require('./app/models/bear');

// ROUTES FOR OUR API
// =============================================================================

// create our router
var router = express.Router();

// middleware to use for all requests
router.use(function(req, res, next) {
   // do logging
   console.log('Something is happening.');
   next();
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
   res.json({ message: 'hooray! welcome to our api!' }); 
});

// getSuggestions
router.route('/suggestion')

   .get(function(req, res) {
      
      industry = req.params.industry;
      companySize = req.params.companySize;
      coType = req.params.coType;

      var resultData = correlate.getCompanyData(req.params.coType, req.params.industry, req.params.companySize);
      // do some processing, create the suggestion object
      //suggestion = {color: "#FF0000", numColors: 3, tags: ["sun", "bright", "ocean"]};
      res.json(resultData);

      
   });


// getRelatedTags
router.route('/tag/:userTag')
   .get(function(req, res) {
      var url = 'mongodb://127.0.0.1:27017/pogomylogo';
      MongoClient.connect(url, function(err, db) {
         userTag = req.params.userTag;
         cur = db.collection('logos-tag').find({tag: {$elemMatch: {tag: userTag}}});
         //console.log(cur.count());
         var popTags = {};
         cur.toArray(function(err, docs) {
            //if(doc != null){
            for(j = 0; j < docs.length; j++) {
            company = docs[j];
            console.log(popTags[company.tag[0].tag]);
            for(i = 0; i < 3; i++) {
               if(popTags[company.tag[i].tag] === undefined && company.tag[i].confidence > 10)
                  popTags[company.tag[i].tag] = company.tag[i].confidence;
            }
            }
            //}
            console.log(popTags);
            res.json(popTags);
         });
      });
   });

// on routes that end in /bears/:bear_id
// ----------------------------------------------------
/*router.route('/bears/:bear_id')

   // get the bear with that id
   .get(function(req, res) {
      Bear.findById(req.params.bear_id, function(err, bear) {
         if (err)
            res.send(err);
         res.json(bear);
      });
   })

   // update the bear with this id
   .put(function(req, res) {
      Bear.findById(req.params.bear_id, function(err, bear) {

         if (err)
            res.send(err);

         bear.name = req.body.name;
         bear.save(function(err) {
            if (err)
               res.send(err);

            res.json({ message: 'Bear updated!' });
         });

      });
   })

   // delete the bear with this id
   .delete(function(req, res) {
      Bear.remove({
         _id: req.params.bear_id
      }, function(err, bear) {
         if (err)
            res.send(err);

         res.json({ message: 'Successfully deleted' });
      });
   });*/


// REGISTER OUR ROUTES -------------------------------
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
