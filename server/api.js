
const express = require('express')
const apiRouter = express.Router();
const path = require('path')
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const config = require("./config/botconfig.json")

apiRouter.get('/v1/user', (req, res) => {

    res.send(req.session.passport)
})

apiRouter.get('/v1/guild', (req, res) => {

    const urlParams = new URLSearchParams()
    urlParams.append('access_token', req.session.passport.user.accessToken)
    
    fetch('https://discord.com/api/v10/guilds/1039724305795252295', {
        
        headers:{
            'Content-Type': 'application/json',
            'Authorization': `Bot ${config.token}`
        }
    }).then(response => response.json())
    .then(data => {
        res.send(data)
    })
    
})

apiRouter.get('/v1/user/premium/role', (req, res) => {
    
    fetch(`https://discord.com/api/v10/guilds/1039724305795252295/members/${req.session.passport.user.user}`, {
        headers:{
            'Content-Type': 'application/json',
            'Authorization': `Bot ${config.token}`
        }
    }).then(response => response.json())
    .then(data => {
        const filter = data.roles.filter(role => role == "1044668796771782716")

        if(filter.length == 0){

            
            return res.send({ premium: false })

        } else {
            
            return res.send({ role: filter, premium: true })
        }
        
    })
})

apiRouter.get('/v1/guild/members', (req, res) => {
    fetch(`https://discord.com/api/v10/guilds/1039724305795252295/members?limit=50`, {
        headers:{
            'Content-Type': 'application/json',
            'Authorization': `Bot ${config.token}`
        }
    }).then(response => response.json()).then(data => res.send(data))
})

module.exports = apiRouter;