var express = require('express');
var router = express.Router();
var dataApi = require("../data/mongoose.js");
var jwt = require("../services/jwt.js");

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('hi');
  res.render('index', { title: 'Express' });
});

// Get New User
router.get("/newUser", function(req, res, next){
  console.log('got to new user');
  dataApi.getNewUser().then(function(user){
    res.json(user.toJson());
  })
});

// Check Auth token
router.get("/checkAuth", function(req, res, next){
  res.json(req.headers)
})

// Get Specific User
router.get("/user", function(req, res, next){
  if(!req.headers.authorization){
    return res.status(401).send({
      message: "Sorry, you do not have access to this page"
    });
  } else {
    var token = req.headers.authorization.split(" ")[1]
    var payload = jwt.decode(token, process.env.SECRET)
    if(payload.sub){
      dataApi.getUser(payload.sub).then(function(user){
        res.json(user.toJson())
      })
    }
  }
});


// Create New User
router.post('/register', function(req, res, next){
  console.log(req.body);
  if(req.body.password != req.body.passwordconfirm){
    res.status(400).send({
      message: 'Your passwords did not match.'
    });
  } else if (!req.body.email){
    res.status(400).send({
      message: 'Your must use a valid email.'
    });
  }
  dataApi.registerUser(req.body).then(function(data){
    var payload = {
      iss: req.hostname,
      sub: data._id
    }
    var token = jwt.encode(payload, process.env.SECRET)
    res.send({
      user: data.toJson(),
      success: true,
      token: token
    })
  }, function(err){
    res.status(400).send({
      message: err
    });
  })
});

// Login as User
router.post('/login', function(req, res, next){
  if(!req.body.email){
    res.status(400).send({
      message: 'Your must use a valid email.'
    });
  }
  dataApi.loginUser(req.body).then(function(data){
    var payload = {
      iss: req.hostname,
      sub: data._id
    }
    var token = jwt.encode(payload, process.env.SECRET)
    res.send({
      user: data.toJson(),
      success: true,
      token: token
    })
  }, function(err){
    res.status(400).send({
      message: err
    });
  })
});

module.exports = router;
