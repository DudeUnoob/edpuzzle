const express = require('express')
const router = express.Router();
const passport = require('passport')
require('./auth/discord')

router.get("/discord", passport.authenticate('discord'), (req, res) => {
    res.send(200)
})

router.get('/api/auth/redirect', passport.authenticate('discord', { successRedirect: '/router/random',failureRedirect:'/router/api/auth/unauthorized'}), (req, res) => {
    res.send(req.session.passport)
})

router.get('/api/auth/unauthorized', (req, res) => {
    
        res.status(401).send("You are not in the puzzlehax server,  <a href='https://discord.gg/uEZeFAaBaK'>join here</a>")
    
   
})
router.get('/random',(req, res) => {
    res.send(req.session.passport)
})

module.exports = router;