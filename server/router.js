const express = require('express')
const router = express.Router();
const passport = require('passport')
require('./auth/discord')

router.get('/api/v1/discord', passport.authenticate('discord'), (req, res) => {
    res.send('got data')
    
})

router.get('/api/v1/auth/discord/redirect', passport.authenticate('discord'), (req, res) => {
    res.send("Hello")
})

module.exports = router;