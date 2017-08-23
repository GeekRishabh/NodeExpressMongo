var express = require('express');
var app = express();
var jwt = require('jsonwebtoken');
var router = express.Router();
var mongoose = require('mongoose');

// our db model
var Animal = require("../models/model.js");
var User = require("../models/userModal.js");
var Customer = require("../models/customerModel.js");
var Account = require("../models/accountModel.js");
var Person = require("../models/account.js");

var auth = require("../auth.js")();
var bodyParser = require("body-parser");
var cfg = require("../config.js");


const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy

app.use(bodyParser.json());
app.use(auth.initialize());

var userDetails;

router.post('/signup', function(req, res){
    
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var buffer = require('crypto').randomBytes(48);
    
    var token =  buffer.toString('hex')
    var userObj = {
      email: email,
      username: username,
      password: password,
      verified:0,
      token:token
    };
    var user = new Person(userObj);

    user.save(function(err,data){
      // if err saving, respond back with error
      if (err){
        var error = {status:'ERROR', message: 'Error saving user'};
        return res.json(error);
      }

      console.log('saved a new user!');
      console.log(data);
      // now return the json data of the new animal
      var jsonData = {
        status: 'OK',
        user: data
      }

      return res.json(jsonData);

    })  
});

router.get('/verify/:id', function(req, res){

  var token = req.param('id');
  var id;
  var dataToUpdate = {};
  if(token == null){
      var error = {status:'ERROR', message: 'Invalid token provided.'};
      return res.json(error);
  } else{
        Person.findOne({
          token: token
        }, function(err, user) {
          if (err) throw err;

          if (!user) {
            res.send({ success: false, message: 'User not found.Invalid token provided.' });
          } else {
                id = user._id;
                //status = 1;verify_token = '';

                dataToUpdate['token'] = null;
                dataToUpdate['verified'] = 1;

                console.log('the data to update is ' + JSON.stringify(dataToUpdate));
                
                Person.findByIdAndUpdate(id, dataToUpdate, function(err,data){
                  // if err saving, respond back with error
                  if (err){
                    var error = {status:'ERROR', message: 'Error updating User'};
                    return res.json(error);
                  }
                  //console.log(data); new data.

                });

                res.json({ success: true, message: user.username+' Successfully verified. Now you can login.'});
            }
        });
    }
})

router.post("/login", function(req, res) {

    Person.findOne({
      email: req.body.email,password:req.body.password
    }, function(err, user) {
      if (err) throw err;

      if (!user) {
        res.send({ success: false, message: 'Authentication failed. User not found.' });
      } else {
        // Check if password matches
        //user.comparePassword(req.body.password, function(err, isMatch) {
          if (user.verified == 1) {
            // Create token if the password matched and no error was thrown
            var token = jwt.sign(user, cfg.jwtSecret, {
              expiresInMinutes: 90 // in seconds
            });

            var payload = {id: user.id};
            //console.log(payload);
            /*var token = jwt.encode(payload, cfg.jwtSecret);
            res.json({token: token});*/

            res.json({ success: true, token: 'Copy token: ' + token });
          } else {
            res.send({ success: false, message: 'Please verify to authenticate.' });
          }
       // });
      }
    });

});

router.get('/forgot',function(req, res) {
    return res.render('forgot');
});

router.post('/forgot',
    function(req, res) {
        var email = req.body.email;
        Person.findOne({
      email: req.body.email
    }, function(err, user) {
      if (err) throw err;

      if (!user) {
        res.send({ success: false, message: 'User not found.' });
      } else {
            Person.findById(user._id, function(err,data){

                // if err or no user found, respond with error 
                if(err || data == null){
                  var error = {status:'ERROR', message: 'Could not find that User'};
                   return res.json(error);
                }
                //return res.json(data);
                console.log(data);
                return res.render('changePassword', { username: data.email, useremail: data.username } );
            })
        }
    });     
});

router.post('/resetPassword',
    function(req, res) {
        var password = req.body.password;
        var confirmPassword = req.body.confirmPassword;
        if(password != confirmPassword){
            var error = {status:'ERROR', message: 'password mismatch'};
            return res.json(error);
        }

        var success = {status:'success', message: 'password Successfully changed'};
        return res.json(success);
});

// route middleware to verify a token
router.use(function(req, res, next) {
    console.log("middleware");
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, cfg.jwtSecret, function(err, decoded) {      
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });    
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        //console.log(req.decoded);    
        userDetails = decoded;
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).send({ 
        success: false, 
        message: 'No token provided.' 
    });
    
  }
});


router.post('/info',
    function(req, res) {
        var token = req.body.token || req.query.token || req.headers['x-access-token'];
        return res.json({ success: false, message: 'Successfully authenticated', user: userDetails._doc });    
});

module.exports = passport;

module.exports = router;