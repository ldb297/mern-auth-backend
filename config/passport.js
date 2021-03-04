require('dotenv').config();
// A passport strategy for authenticating with a JSON Web Token
// This allows to authenticate endpoints using a token
// const JwtStrategy = require('passport-jwt').Strategy
// const ExtractJwt = require('passport-jwt').ExtractJwt
//how would we refactor the above two lines w/ destructuring
const { Strategy, ExtractJwt } = require('passport-jwt')
const mongoose = require('mongoose')

//import user model
const { User } = require('../models/user')

const options = {}; //create an empty options object
//added two keys to object to access later
options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken() 
options.secretOrKey = process.env.JWT_SECRET

module.exports = (passport) => {
    // Add code here
    passport.use(new Strategy(options, (jwt_payload, done) =>{
        //have a user that we're finding by id inside of payload
        //when we get user back we;ll check to see if user is in db
        User.findById(jwt_payload.id)
        .then(user =>{
            //jwt_payload is an object that contains our JWT data
            //done is a callback that we will be using to return user or false
            if(user){
                //if a user is found, return donewith null (for error) and user
                return done(null, user)
            } else {
                //no user is found
                return done(null, false)
            }
            // this as a ternary operator
            // const userOrNot = user ? done(null,user) : done(null, false)
            // return userOrNot
        })
        .catch(error => {
            console.log(`>>>>>>>>> error below (passport.js module export)`)
            console.log(error)
        })
    }))
}