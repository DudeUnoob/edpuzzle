
const express = require('express')
const router = express.Router();
const passport = require('passport');
const path = require('path');
require('./auth/discord')
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const serverImages = { root: path.join(__dirname, './public/images')}



router.get("/discord", passport.authenticate('discord'), (req, res) => {
    res.send(200)
})


router.get('/api/auth/redirect', passport.authenticate('discord', { successRedirect: '/',failureRedirect:'/router/api/auth/404'}), (req, res) => {
    res.send(req.session.passport)
})

router.get('/public/images/backgroundDarkVoid.png', (req, res) => {
    
    res.sendFile('backgroundDarkVoid.png', serverImages)
})



router.get('/random',(req, res) => {
    res.send(req.session.passport)
    console.log(__dirname)
})

router.get('/api/auth/404', (req, res) => {
    res.sendFile('unauthorized.html', { root: path.join(__dirname, './public/404')})
})

module.exports = router;






