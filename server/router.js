const express = require('express')
const router = express.Router();
const passport = require('passport')
require('./auth/discord')

router.get("/discord", passport.authenticate('discord'), (req, res) => {
    res.send(200)
})

router.get('/api/auth/redirect', passport.authenticate('discord'), (req, res) => {
    res.send(req.session.passport)
})

router.get('/random',(req, res) => {
    res.send(req.session.passport)
})

module.exports = router;