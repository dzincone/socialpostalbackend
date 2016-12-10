var express = require('express');
var router = express.Router();
var passport = require('passport');
var rp = require('request-promise');
var jwt = require("../services/jwt.js");
var dataApi = require("../data/mongoose.js");
var URL = "http://localhost:3000/";
// var Linkedin = require('node-linkedin')(process.env.LINKEDIN_CLIENT_ID, process.env.LINKEDIN_CLIENT_SECRET);

router.get('/auth/linkedin', function(req, res, next){
  req.session.userId = req.query.id;
  if(req.headers.referer == URL + 'user'){
    next();
  } else {
    res.redirect(URL);
  }
}, passport.authenticate('linkedin', { state: 'kjasASDFASDfkdjafDASDF'  }));

router.get('/auth/linkedin/callback',
  passport.authenticate('linkedin', {failureRedirect: URL}),
  function(req, res) {
    var postLinkedinOptions = {
      method: 'POST',
      uri: URL + 'api/linkedin/postCredentials',
      body: {
        id: req.session.userId,
        creds: req.user._json,
        auth: {token: req.user.accessToken}
      },
      json: true
    };
    rp(postLinkedinOptions).then(function(data){
      res.redirect(URL + 'success');
    })
    .catch(function(err){
      res.redirect(URL);
    });
  });

    router.post('/linkedin/postCredentials', function(req, res, next){
      dataApi.updateCreds('linkedin', req.body).then(function(thing){
        console.log('*************************************');
        console.log(thing);

      }, function(err){
        console.log('-----------------------------------');
        console.log(err);
      })
    });

router.get('/auth/twitter', function(req, res, next){
  req.session.userId = req.query.id;
  if(req.headers.referer == URL + 'user'){
    next();
  } else {
    res.redirect(URL);
  }
}, passport.authenticate('twitter'));

router.get('/auth/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: URL }),
  function(req, res) {
      var postTwitterOptions = {
        method: 'POST',
        uri: URL + 'api/twitter/postCredentials',
        body: {
            id: req.session.userId,
            creds: req.user._json,
            auth: {token: req.user.token, tokenSecret: req.user.tokenSecret}
        },
        json: true
    };
    rp(postTwitterOptions)
        .then(function (data) {
          res.redirect(URL + 'success');
        })
        .catch(function (err) {
          res.redirect(URL);
        });
  });

  router.post('/twitter/postCredentials', function(req, res, next){
    dataApi.updateCreds('twitter', req.body).then(function(thing){
      console.log('*************************************');
      console.log(thing);

    }, function(err){
      console.log('-----------------------------------');
      console.log(err);
    })
  });

  router.post('/signOutMedia', function(req, res, next){
    console.log(req.body);
    if(!req.headers.authorization){
      return res.status(401).send({
        message: "Sorry, you do not have access to this page"
      });
    } else {
      var token = req.headers.authorization.split(" ")[1];
      var payload = jwt.decode(token, process.env.SECRET);
      if(payload.sub){
        dataApi.signOutMedia(payload.sub, req.body.media).then(function(user){
          res.json(user.toJson())
        })
      }
    }
  })

// router.post('/twitter/postCredentials', function(req, res, next){
// console.log(req.body.creds);
// }


module.exports = router;
