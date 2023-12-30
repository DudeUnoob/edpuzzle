
const express = require('express')
const apiRouter = express.Router();
const bodyParser = require('body-parser')
const path = require('path')
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const config = require("./config/botconfig.json");
const axios = require('axios');
const { routerHost } = require("./config/config.json")

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

apiRouter.post('/v1/edpuzzle/complete-question', async (req, res, next) => {
    try {
        //https://edpuzzle.com/api/v3/attempts/658070bddde980e974ef5361/answers

        // fetch('https://localhost:3000/api/v1/user/premium/role')
        // .then(res => res.json())
        // .then(statement => {
        //     if(statement.premium != true){
        //         return res.status(400).send("Sorry you need premium to access this!")


        //     }
        // })
        if(!req.session.passport.user.user){
            return res.status(400).send({ message: "Sorry you need to be logged in with discord to access this!", statusCode: 400 })
        } else {
            fetch(`https://discord.com/api/v10/guilds/1039724305795252295/members/${req.session.passport.user.user}`, {
                headers:{
                    'Content-Type': 'application/json',
                    'Authorization': `Bot ${config.token}`
                }
            }).then(response => response.json())
            .then(async data => {
                const filter = data.roles.filter(role => role == "1044668796771782716")

                if(filter.length == 0){
        
                    
                    return res.status(400).send({ message: "Sorry you need to have premium to access this! Get it here: http://patreon.com/DomK", statusCode: 400 })
        
                } else {
                    const response = await fetch('http://localhost:3000/edpuzzle/csrf')

                    const final = await response.json()
                  
            
                    //   fetch(`https://www.unpuzzle.net/api/complete-questions`, {
                    //     method:"post",
                    //     headers:{
                    //       "Content-Type":"application/json",
                          
                    //     },
                    //     body: req.body
                    //   }).then(res => res.json())
                    //   .then(statement => console.log(statement))
                    console.log(req.session.attempt_id)
                    console.log(JSON.stringify(req.body))
                    fetch(`https://edpuzzle.com/api/v3/attempts/${req.session.attempt_id}/answers`, {
                        method:"post",
                        headers:{
                            "Content-Type":"application/json",
                            "Cookie":`token=${req.session.token}; edpuzzleCSRF=FHBpCb2INy6dNw0QZKPGbeKx;`,
                            "x-csrf-token": "0J07nPIa-aL17wtlQe_n-rW3iylXzF-ef8ZY"
                        },
                        body: JSON.stringify(req.body)
                        
                    }).then(response => {
                        if(response.status == 200){
            
                            const data = response.json()
                            return res.status(200).json({ message: `Successfully submitted questionId: ${req.body.answers[0].questionId}`, data: data, statusCode: 200 })
                        } else {
                            return res.status(400).json({ error: "Answer failed to submit", statusCode: 400 })
                        }
                    })
                }
            })
        }
        
        

    } catch (error) {
        console.error("Error completing question:", error.message);
        return res.status(500).send({ error: 'Internal Server Error', statusCode: 400 }); // Handle error appropriately
    }
});

apiRouter.post('/v1/skip_video', async(req, res) => {
    fetch(`https://edpuzzle.com/api/v4/media_attempts/${req.session.attempt_id}/watch`, {
        method:"POST",
        headers: {
            "Content-Type":"application/json",
            "Cookie": `edpuzzleCSRF=tGQHPZ1sphZUeSCEWhFqArrx;token=${req.session.token};`,
            "X-Csrf-Token":"ZuL0iFe5-P9kZtknATzOpqEG0bfJkz43osh8"
        },
        body:JSON.stringify({
            timeIntervalNumber: 10
        })
    }).then(response => {
        res.send(response.ok)
    })
})

apiRouter.get('/user', (req, res) => {
    res.send({ user: req.session.passport.user.user })
})
module.exports = apiRouter;