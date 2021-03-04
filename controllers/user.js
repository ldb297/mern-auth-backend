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
            const newUser = new User({
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

//exports 

module.exports = { test, register }