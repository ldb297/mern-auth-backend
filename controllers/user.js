//imports 
require('dotenv').config()
const passport = require('passport')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = process.env

//database
const db = require('../models')


//ctrlrs
const test = (req,res) =>{
    res.json({ message: 'user endpoint ok!'})
}

const register = (req,res) =>{
    //POST > adding new user to database
    console.log(`>>>>>>> inside /register`)
    console.log(`>>>>>>> req.body`)
    console.log(req.body)

    db.User.findOne({email: req.body.email})
    .then(user =>{
        //if email already exist, user will be returned
        if(user){
            return res.status(400).json({message: 'Email already exists'})
        } else {
            const newUser = new db.User({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password
            })
            //salt and hash password before saving user
            bcrypt.genSalt(10, (err, salt)=>{
                if(err) throw Error

                bcrypt.hash(newUser.password, salt, (err, hash)=>{
                    if(err) console.log(`>>>> error inside of hash ${err}`)
                    //change the password in newUser to hash
                    newUser.password = hash
                    newUser.save()
                    .then(createdUser => res.json(createdUser))
                    .catch(err => console.log(err))
                })
            })
        }
    })
    .catch(err=>{
        console.log(`error finding user: ${err}`)
    })
}

const login = async (req,res) => {
    //post to find user, authenticate, and return
    console.log(`>>>>>>> inside /login`)
    console.log(`>>>>>>> req.body`)
    console.log(req.body)

    const foundUser = await db.User.findOne({ email: req.body.email })

    if(foundUser){
        // user has been located in database
        let isMatch =  await bcrypt.compare(req.body.password, foundUser.password)
        console.log(isMatch)
        if (isMatch){
        // if user is matched, then we want to send a json web token
        // create a token payload 
        // add an expiredToken = Date.now()
        // save the user
            const payload = {
                id: foundUser.id,
                email: foundUser.email,
                name: foundUser.name
            }

        //setting hourly token expiration
            jwt.sign(payload, JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
                if(err) {
                    // 3600s token has expired
                    res.status(400).json({ message: 'Session has ended, please log in again'})
                }
                // a bearer token to check that user's login token is still valid with each req
                const legit = jwt.verify(token, JWT_SECRET, { expiresIn: 60 })
                console.log(`>>>>>>>> legit`)
                console.log(`${legit}`)
                res.json({ success: true, token: `Bearer ${token}`, userData: legit})
            })
        } else {
            //this is the else statement for isMatch
            return res.status(400).json({ message: 'Email or Password incorrect'})
        }
        //this is the else statement for foundUser
    } else {
        return res.status(400).json({ message: 'User not found'})
    }
}

//exports 

module.exports = { test, register, login }