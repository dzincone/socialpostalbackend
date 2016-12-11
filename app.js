var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('cookie-session')
// require('dotenv').load();
var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;
var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;


passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_ID,
  clientSecret: process.env.FACEBOOK_SECRET,
  callbackURL: process.env.URL + 'auth/facebook/callback',
  profileFields: ['id', 'email', 'picture']
}, function(accessToken, refreshToken, profile, done) {
  process.nextTick(function () {
    console.log('-----------------');
    console.log(accessToken);
    profile.accessToken = accessToken;
    return done(null, profile);
  });
}));

passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CLIENT_ID,
    consumerSecret: process.env.TWITTER_CLIENT_SECRET,
    callbackURL: process.env.URL + 'auth/twitter/callback',
}, function(token, tokenSecret, profile, cb) {
  process.nextTick(function() {
    console.log('----------------------');
    console.log(token, tokenSecret);
    profile.token = token;
    profile.tokenSecret = tokenSecret;
    return cb(null, profile);
  });
}));

passport.use(new LinkedInStrategy({
  clientID: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  callbackURL: process.env.URL + 'auth/linkedin/callback',
  scope: ['r_emailaddress', 'r_basicprofile', 'w_share', 'rw_company_admin']
}, function(accessToken, refreshToken, profile, done) {
  process.nextTick(function () {
    console.log('-----------------');
    console.log(accessToken);
    profile.accessToken = accessToken;
    return done(null, profile);
  });
}));


var routes = require('./routes/index');
var users = require('./routes/users');
var api = require('./routes/api');
var socialMedia = require('./routes/socialMedia');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ keys: [process.env.SESSION_KEY1, process.env.SESSION_KEY2] }));
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next){
    res.locals.user = req.session;
    next();
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

app.use('/', routes);
app.use('/users', users);
app.use('/api', api);
app.use('/api', socialMedia)

app.get('*', function(req, res) {
  res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
