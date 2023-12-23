
const express = require('express')
const apiRouter = express.Router();
const bodyParser = require('body-parser')
const path = require('path')
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const config = require("./config/botconfig.json");
const axios = require('axios');


apiRouter.use(bodyParser.urlencoded({ extended: true }));
apiRouter.use(express.json())
apiRouter.use(bodyParser.json())
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


apiRouter.post('/kahoot/bots', (req, res) => {
    const gamePin = req.body.gamePin
    const kahootBots = req.body.botAmount
    const kahootBotName = req.body.botName
    
    
    fetch(`https://discord.com/api/v10/guilds/1039724305795252295/members/${req.body.userId}`, {
        headers:{
            'Content-Type': 'application/json',
            'Authorization': `Bot ${config.token}`
        }
    }).then(response => response.json())
    .then(data => {
        const filter = data.roles.filter(role => role == "1044668796771782716")

        if(filter.length == 0){

            
            return res.send({ message: "Sorry you don't have premium, get it here at http://patreon.com/DomK" })

        } else {
            
            fetch('https://kahootbotter.com/api/graphql', {
                method:"post",
                headers:{
                    'Content-Type':"application/json"
                },
                body:JSON.stringify({
                    query: "mutation spawnBots($botName: String!, $gamePin: Int!, $botAmount: Int!, $sessionId: String!) {\n  spawnBots(\n    botName: $botName\n    gamePin: $gamePin\n    botAmount: $botAmount\n    sessionId: $sessionId\n  ) {\n    title\n    status\n    description\n    __typename\n  }\n}\n",
                    operationName: "spawnBots",
                    variables: {
                      botName: kahootBotName,
                      gamePin: parseInt(gamePin),
                      botAmount: parseInt(kahootBots),
                      sessionId: "138.199.9.179"
                    },
                    
                  })
            }).then(get => get.json())
            .then(data => {
                return res.send({ message: data })
            })
        }
        
    })
})

apiRouter.get('/v1/get_token', (req, res) => {
    res.send({ token: req.session.token })
})

apiRouter.post('/v1/edpuzzle/complete-question', async (req, res) => {
    try {
        //https://edpuzzle.com/api/v3/attempts/658070bddde980e974ef5361/answers

        // fetch('https://localhost:3000/api/v1/user/premium/role')
        // .then(res => res.json())
        // .then(statement => {
        //     if(statement.premium != true){
        //         return res.status(400).send("Sorry you need premium to access this!")


        //     }
        // })
        
        fetch(`https://edpuzzle.com/api/v3/attempts/${req.session.attempt_id}/answers`, {
            method:"post",
            headers:{
                "Content-Type":"application/json",
            },
            body: req.body
            
        }).then(res => res.json())
        .then(data => console.log(data))

        return res.status(200).send("Successfully completed?");
    } catch (error) {
        console.error("Error completing question:", error.message);
        return res.status(500).send({ error: 'Internal Server Error' }); // Handle error appropriately
    }
});

apiRouter.get('/user', (req, res) => {
    res.send({ user: req.session.passport.user.user })
})
module.exports = apiRouter;