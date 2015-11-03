var MongoClient = require('mongodb').MongoClient
  , assert = require('assert')
  , ObjectID = require('mongodb').ObjectID
  , express = require('express')
  , http = require('http')
  , passport = require('passport')
  , util = require('util')
  , LinkedInStrategy = require('passport-linkedin').Strategy;

var app = express();
var theToken

// configure Express
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.logger());
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.session({ secret: 'keyboard cat' }));
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(__dirname + '/public'));

var Linkedin = require('node-linkedin')('75zynxm4k5tvxy', 'aLHiVsAkDOCWuGhu', 'http://162.243.144.203:3000/linkedin/callback');
var linkedin;

// Using a library like `expressjs` the module will
// redirect for you simply by passing `res`.
app.get('/linkedin', function(req, res) {
   // This will ask for permisssions etc and redirect to callback url.
   var scope = ['r_basicprofile'];
   Linkedin.auth.authorize(res, scope);
});

// Again, `res` is optional, you could pass `code` as the first parameter
app.get('/linkedin/callback', function(req, res) {
   Linkedin.auth.getAccessToken(res, req.query.code, req.query.state, function(err, results) {
      if ( err )
         return console.error(err);

      console.log(results.access_token);
      theToken = results.access_token;

      linkedin = Linkedin.init(results.access_token, {});

      res.render('index', { user: "User", token: theToken });
      
      //return res.redirect('/load-data');
   });
});

app.get('/load-data/:companyName', function(req, res) {
   theToken = "AQW_E4dZK8tSttBoW5dtUSOWR87ypE_anFmZYF9h8Asfy-QSM2sjY8nFKPAARBtnNETzcKWMoL_k2X-xmNMZxOeVCCfHuJSPhA7ekxYXTh98vOxWjCKGr1Q6XPcbWdM8jVO25QP7XYiciWZXk9krvhKctKmC-WO5Rb9c8qhj_pIrKghKpO8";

   linkedin = Linkedin.init(theToken, {});
   
   linkedin.companies_search.name(req.params.companyName, 1, function(err, company) {
      companyData = company.companies.values[0];

      var url = 'mongodb://127.0.0.1:27017/pogomylogo';
      MongoClient.connect(url, function(err, db) {
         if(err) {
            console.log(err);
         }
         else {
            assert.equal(null, err);
            console.log("Connected correctly to server.");

            var collection = db.collection('companies-test');
    
            //var user1 = {name: name, desc: desc, industry: industry, city: city, websiteUrl: websiteUrl};
            collection.insert(companyData, function(err, result) {
               if(err) {
                  console.log(err);
               }
               else {
                  res.render('index', { user: req.user, token: theToken });
               }
               db.close();
            });
         }
      });
   });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


/*var MongoClient = require('mongodb').MongoClient
  , assert = require('assert')
  , ObjectID = require('mongodb').ObjectID
  , express = require('express')
  , http = require('http')
  , passport = require('passport')
  , util = require('util')
  , LinkedInStrategy = require('passport-linkedin').Strategy;

var app = express();

// configure Express
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.logger());
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.session({ secret: 'keyboard cat' }));
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(__dirname + '/public'));

var LINKEDIN_API_KEY = "75zynxm4k5tvxy";
var LINKEDIN_SECRET_KEY = "aLHiVsAkDOCWuGhu";

var theToken = "";

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete LinkedIn profile is
//   serialized and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


// Use the LinkedInStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a token, tokenSecret, and LinkedIn profile), and
//   invoke a callback with a user object.
passport.use(new LinkedInStrategy({
    consumerKey: LINKEDIN_API_KEY,
    consumerSecret: LINKEDIN_SECRET_KEY,
    callbackURL: "http://162.243.144.203:3000/auth/linkedin/callback"
  },
  function(token, tokenSecret, profile, done) {
    theToken = token;
    // asynchronous verification, for effect...
    process.nextTick(function () {
      // To keep the example simple, the user's LinkedIn profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the LinkedIn account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));

app.get('/', function(req, res){
  var url = 'mongodb://127.0.0.1:27017/pogomylogo';
  MongoClient.connect(url, function(err, db) {
     if(err) {
        console.log(err);
     }
     else {
        assert.equal(null, err);
        console.log("Connected correctly to server.");

        var collection = db.collection('testing');

        var user1 = {name: "aaron", lastname: "pramana"};
        collection.insert(user1, function(err, result) {
           if(err) {
              console.log(err);
           }
           else {
              console.log("hi");
           }
           db.close();
        });
     }
  });

  res.render('index', { user: req.user, token: theToken });
});

app.get('/loadcompanies', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

// GET /auth/linkedin
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in LinkedIn authentication will involve
//   redirecting the user to linkedin.com.  After authorization, LinkedIn will
//   redirect the user back to this application at /auth/linkedin/callback
app.get('/auth/linkedin',
  passport.authenticate('linkedin'),
  function(req, res){
    // The request will be redirected to LinkedIn for authentication, so this
    // function will not be called.
  });

// GET /auth/linkedin/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/linkedin/callback',
  passport.authenticate('linkedin', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}
*/
