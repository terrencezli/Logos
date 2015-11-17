var linkedIn = require('./LinkedInAPI');

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

app.get('/linkedin', function(req, res) {
   // This will ask for permisssions etc and redirect to callback url.
   var scope = ['r_basicprofile'];
   Linkedin.auth.authorize(res, scope);
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
