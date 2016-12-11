var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.connect(process.env.MONGOLAB_URI);
var bcrypt = require("bcryptjs");


// User Schema
var userSchema = new mongoose.Schema({
  email: {type: String, default: ""},
  password: {type: String, default: ""},
  posts: {type: Array, default: []},
  twitterCreds: {},
  linkedinCreds: {},
  facebookCreds: {}
});
// Post Schema
var postSchema = new mongoose.Schema({
  userId: {type: mongoose.Schema.Types.ObjectId, ref: 'Users'},
  leagueName: {type: String, default: ""},
  divisions: {type: Array, default: []},
  locations: {type: Array, default: []},
  startDate: {type: Date, default: Date.now()},
  endDate: {type: Date, default: ""},
  coachesEmails: {type: Array, default: []}
});

userSchema.methods.toJson = function(){
  var user = this.toObject();
  delete user.password;
  return user;
}


// LyneUp Models
var Users = mongoose.model("Users", userSchema, "Users");
var Posts = mongoose.model("Posts", postSchema, "Posts");


module.exports = {

  // Get Fresh User
  getNewUser: function(){
      return new Promise(function(resolve, reject){
          resolve(new Users())
      })
  },
  // Get Authorized user
  getUser: function(id){
    return Users.findOne({_id: id})
  },
  // Get All Users
  getUsers: function(){
    return Users.find();
  },
  // Post User
  registerUser: function(obj){
    var hash = bcrypt.hashSync(obj.password, 8);
    obj.password = hash;
    delete obj.confirmpassword;
    return Users.findOne({email: obj.email}).then(function(user){
      if(user){
        return new Promise(function(resolve, reject){
          reject("Email has already been used to sign up");
        });
      } else {
      return Users.findByIdAndUpdate(obj._id, obj, {upsert: true, new: true});
      }
    });

  },
  // Post User for Login
  loginUser: function(obj){
    return Users.findOne({email: obj.email}).then(function(data){
      var crypt = bcrypt.compareSync(obj.password, data.password);
      if (crypt){
        return data
      } else {
        return new Promise(function(resolve, reject){
          reject("Email/Password combination did not match.")
        });
      }
    }, function(err){

      console.log('could not find the email');
      console.log(err);
      return err
    })
  },

  // Update Credentials
  updateCreds: function(media, obj){
    var newObj = {};
    switch(media){
      case 'twitter':
        newObj.profile = obj.creds;
        newObj.auth = obj.auth;
        return Users.findByIdAndUpdate(obj.id, {twitterCreds: newObj}, {upsert: true, new: true});
        break;
      case 'linkedin':
        newObj.profile = obj.creds;
        newObj.auth = obj.auth;
        return Users.findByIdAndUpdate(obj.id, {linkedinCreds: newObj}, {upsert: true, new: true});
        break;
      case 'facebook':
        newObj.profile = obj.creds;
        newObj.auth = obj.auth;
        return Users.findByIdAndUpdate(obj.id, {facebookCreds: newObj}, {upsert: true, new: true});
        break;
    }
  },

  signOutMedia: function(obj, media){
    console.log('signoutmedia');
    console.log(obj);
    console.log(media);
    switch(media){
      case 'twitter':
        return Users.findByIdAndUpdate(obj, {twitterCreds: ''}, {new: true});
        break;
      case 'linkedin':
        return Users.findByIdAndUpdate(obj, {linkedinCreds: ''}, {new: true});
        break;
      case 'facebook':
        return Users.findByIdAndUpdate(obj, {facebookCreds: ''}, {new: true});
        break;
    }
  }
  // // Get League
  // getLeague: function(id){
  //   if(id != "New League"){
  //     return Leagues.findOne({_id: id});
  //   } else {
  //     return new Promise(function(resolve, reject){
  //         resolve(new Leagues())
  //     })
  //   }
  // },
  // // Get All Leagues
  // getLeagues: function(){
  //   return Leagues.find()
  // },
  // // Post League
  // postLeague: function(obj){
  //   return Leagues.update({_id: obj._id}, obj, {upsert: true})
  // },
  // // Get Division
  // getDivision: function(id){
  //   if(id != "New Division"){
  //     return Divisions.findOne({_id: id});
  //   } else {
  //     return new Promise(function(resolve, reject){
  //         resolve(new Divisions())
  //     })
  //   }
  // },
  // // Get All Divisions
  // getDivisions: function(){
  //   return Divisions.find()
  // },
  // // Get Divisions for Specific League
  // getDivisionsForLeague: function(leagueId){
  //   return Leagues.find({_id: leagueId}).populate("divisions");
  // }


};
