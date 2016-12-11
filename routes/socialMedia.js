var express = require('express');
var router = express.Router();
var passport = require('passport');
var rp = require('request-promise');
var jwt = require("../services/jwt.js");
var dataApi = require("../data/mongoose.js");
var URL = "http://localhost:3000/";
var FB = require('fb');
var Linkedin = require('node-linkedin')(process.env.LINKEDIN_CLIENT_ID, process.env.LINKEDIN_CLIENT_SECRET);
var Twitter = require('twitter');

router.get('/auth/facebook', function(req, res, next){
  req.session.userId = req. query.id;
  if(req.headers.referer == URL + 'user'){
    next();
  } else {
    res.redirect(URL);
  }
}, passport.authenticate('facebook', { scope: ['email', 'manage_pages', 'publish_actions'] }));

router.get('/auth/facebook/callback',
  passport.authenticate('facebook', {failureRedirect: URL}),
  function(req, res) {
    var postFacebookOptions = {
      method: 'POST',
      uri: URL + 'api/facebook/postCredentials',
      body: {
        id: req.session.userId,
        creds: req.user._json,
        auth: {token: req.user.accessToken}
      },
      json: true
    };
    rp(postFacebookOptions).then(function(data){
      res.redirect(URL + 'success');
    })
    .catch(function(err){
      res.redirect(URL);
    });
  });

router.post('/facebook/postCredentials', function(req, res, next){
  dataApi.updateCreds('facebook', req.body).then(function(thing){
    console.log('*************************************');
    console.log(thing);

  }, function(err){
    console.log('-----------------------------------');
    console.log(err);
  })
});

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
  });

  router.post('/postMedia', function(req, res, next){
    console.log(req.body);
      if(!req.headers.authorization){
        return res.status(401).send({
          message: "Sorry, you do not have access to this page"
        });
      } else {
        var token = req.headers.authorization.split(" ")[1];
        var payload = jwt.decode(token, process.env.SECRET);
        if(payload.sub){
          dataApi.getUser(payload.sub).then(function(user){
            console.log(user);

            var tokens = req.body;
            var status = req.body.text;
            var media, media_id;
            var company = {};
            if(req.body.media_id) var media_id = req.body.media_id;
            if(req.body.media) var media = req.body.media;
            if(req.body.company) var company = req.body.company;
            if(status.length > 140){
              var twitterStatus = status.substring(0, 140);
            } else {
              var twitterStatus = status;
            }

            if(tokens.facebookCreds.focus && tokens.twitterCreds.focus && tokens.linkedinCreds.focus){
              // All three

              var client = new Twitter({
                consumer_key: process.env.TWITTER_CLIENT_ID,
                consumer_secret: process.env.TWITTER_CLIENT_SECRET,
                access_token_key: user.twitterCreds.auth.token,
                access_token_secret: user.twitterCreds.auth.tokenSecret
              });
              var twitterParams = {status: twitterStatus};
              if(media_id) twitterParams.media_ids = media_id;
              client.post('statuses/update', twitterParams, function(err, tweet, response){
                if(err){
                  console.log('there was an error');
                  return;
                } else {
                  FB.setAccessToken(user.facebookCreds.auth.token);
                  FB.api('me/feed', 'post', { message: status }, function (fbstatus) {
                    if(!fbstatus || fbstatus.error) {
                      console.log(!fbstatus ? 'error occurred' : fbstatus.error);
                      return;
                    } else {
                      console.log('facebook posted', fbstatus);
                      var linkedin = Linkedin.init(user.linkedinCreds.auth.token);
                      var linkedinparams = {comment: status, visibility: {code: 'anyone'}};
                      if(media) linkedinparams.content= {'submitted-image-url': media, 'submitted-url': media};
                      if(company.li && company.selected.id != 'user'){
                        linkined.companies.share(company.selected.id, linkedinparams, function(err, data){
                           if(err){
                              // global.errorCount.postSocialMedia++;
                              // if (global.errorCount.postSocialMedia <= 5) {
                              //   techErrorEmail.sendMail(err);
                              // }
                              console.log(err);
                              return;
                            }
                            console.log(data);
                            res.json(data)
                        });
                      } else {
                        linkedin.people.share(linkedinparams, function(err, data) {
                          if(err){
                          //   global.errorCount.postSocialMedia++;
                          //   if (global.errorCount.postSocialMedia <= 5) {
                          //     techErrorEmail.sendMail(err);
                          //   }
                            console.log(err);
                            return;
                          }
                          console.log(data);
                          res.json(data)
                        });
                      }
                    };
                  });
                }
              });


            } else if(tokens.facebookCreds.focus && tokens.linkedinCreds.focus){
              // FB and LI
              console.log('posting to facebook and linked in');
              FB.setAccessToken(user.facebookCreds.auth.token);
              FB.api('me/feed', 'post', { message: status }, function (fbstatus) {
                if(!fbstatus || fbstatus.error) {
                  console.log(!fbstatus ? 'error occurred' : fbstatus.error);
                  return;
                } else {
                  var linkedin = Linkedin.init(user.linkedinCreds.auth.token);
                  var linkedinparams = {comment: status, visibility: {code: 'anyone'}};
                  if(media) linkedinparams.content= {'submitted-image-url': media, 'submitted-url': media};
                  linkedin.people.share(linkedinparams, function(err, data) {
                    if(err){
                      // global.errorCount.postSocialMedia++;
                      // if (global.errorCount.postSocialMedia <= 5) {
                      //   techErrorEmail.sendMail(err);
                      // }
                      console.log(err);
                      return;
                    }
                    console.log(data);
                    res.json(data)
                  });
                };
              });

            } else if(tokens.facebookCreds.focus && tokens.twitterCreds.focus){
              // FB and TW
              var client = new Twitter({
                consumer_key: process.env.TWITTER_CLIENT_ID,
                consumer_secret: process.env.TWITTER_CLIENT_SECRET,
                access_token_key: user.twitterCreds.auth.token,
                access_token_secret: user.twitterCreds.auth.tokenSecret
              });
              var twitterParams = {status: twitterStatus};
              if(media_id) twitterParams.media_ids = media_id;
              client.post('statuses/update', twitterParams, function(err, tweet, response){
                if(err){
                  console.log('there was an error');
                  return;
                } else {
                  FB.setAccessToken(user.facebookCreds.auth.token);
                  FB.api('me/feed', 'post', { message: status }, function (fbstatus) {
                    if(!fbstatus || fbstatus.error) {
                      console.log(!fbstatus ? 'error occurred' : fbstatus.error);
                      return;
                    } else {
                      res.json(fbstatus)
                    };
                  });
                }
              });

            } else if(tokens.twitterCreds.focus && tokens.linkedinCreds.focus){
              // TW and LI
              var client = new Twitter({
                consumer_key: process.env.TWITTER_CLIENT_ID,
                consumer_secret: process.env.TWITTER_CLIENT_SECRET,
                access_token_key: user.twitterCreds.auth.token,
                access_token_secret: user.twitterCreds.auth.tokenSecret
              });
              var twitterParams = {status: twitterStatus};
              if(media_id) twitterParams.media_ids = media_id;
              client.post('statuses/update', twitterParams, function(err, tweet, response){
                if(err){
                  console.log('there was an error');
                  return;
                } else {
                  var linkedin = Linkedin.init(user.linkedinCreds.auth.token);
                  var linkedinparams = {comment: status, visibility: {code: 'anyone'}};
                  if(media) linkedinparams.content= {'submitted-image-url': media, 'submitted-url': media};
                  if(company.li && company.selected.id != 'user'){
                    linkined.companies.share(company.selected.id, linkedinparams, function(err, data){
                       if(err){
                          // global.errorCount.postSocialMedia++;
                          // if (global.errorCount.postSocialMedia <= 5) {
                          //   techErrorEmail.sendMail(err);
                          // }
                          console.log(err);
                          return;
                        }
                        console.log(data);
                        res.json(data)
                    });
                  } else {
                    linkedin.people.share(linkedinparams, function(err, data) {
                      if(err){
                        // global.errorCount.postSocialMedia++;
                        // if (global.errorCount.postSocialMedia <= 5) {
                        //   techErrorEmail.sendMail(err);
                        // }
                        console.log(err);
                        return;
                      }
                      console.log(data);
                      res.json(data)
                    });
                  }
                }
              });
            } else if(tokens.facebookCreds.focus){
              // Just FB
              console.log('posting just to facebook');
              FB.setAccessToken(user.facebookCreds.auth.token);

              FB.api('me/feed', 'post', { message: status }, function (status) {
                if(!status || status.error) {
                  console.log(!status ? 'error occurred' : status.error);
                  return;
                }
                res.json(status)
                console.log('Post Id: ' + status.id);
              });


            } else if (tokens.twitterCreds.focus){
              // Just TW

              var client = new Twitter({
                consumer_key: process.env.TWITTER_CLIENT_ID,
                consumer_secret: process.env.TWITTER_CLIENT_SECRET,
                access_token_key: user.twitterCreds.auth.token,
                access_token_secret: user.twitterCreds.auth.tokenSecret
              });
              var twitterParams = {status: twitterStatus};
              if(media_id) twitterParams.media_ids = media_id;
              client.post('statuses/update', twitterParams, function(err, tweet, response){
                if(err){
                  // global.errorCount.postSocialMedia++;
                  // if (global.errorCount.postSocialMedia <= 5) {
                  //   techErrorEmail.sendMail(err);
                  // }
                  console.log('there was an error');
                  return
                }
                res.json(tweet);
              });

            } else if (tokens.linkedinCreds.focus){
              // Just LI
              console.log('posting just to linked in');
              var linkedin = Linkedin.init(user.linkedinCreds.auth.token);
              var linkedinparams = {comment: status, visibility: {code: 'anyone'}};
              if(media) linkedinparams.content = {'submitted-image-url': media, 'submitted-url': media};
              console.log(linkedinparams);
              if(company.li && company.selected.id != 'user'){
                linkined.companies.share(company.selected.id, linkedinparams, function(err, data){
                   if(err){
                      // global.errorCount.postSocialMedia++;
                      // if (global.errorCount.postSocialMedia <= 5) {
                      //   techErrorEmail.sendMail(err);
                      // }
                      console.log(err);
                      return;
                    }
                    console.log(data);
                    res.json(data)
                });
              } else {
                console.log('should be in the second part');
                linkedin.people.share(linkedinparams, function(err, data) {
                  if(err){
                    // global.errorCount.postSocialMedia++;
                    // if (global.errorCount.postSocialMedia <= 5) {
                    //   techErrorEmail.sendMail(err);
                    // }
                    console.log(err);
                    return;
                  }
                  console.log(data);
                  res.json(data)
                });
              }
            }


          })
        }
      }
  });

// router.post('/twitter/postCredentials', function(req, res, next){
// console.log(req.body.creds);
// }


module.exports = router;
