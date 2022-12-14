const express = require('express')
const bodyParser = require("body-parser")
const config = require('./server/config/botconfig.json')
const app = express()
const axios = require('axios')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const replHost = "https://edpuzzle.dudeunoob.repl.co"
let host = 'https://puzzlehax.ml'
const localhost = 'http://localhost:3000'
const router = require('./server/router')
const passport = require('passport')
const dashboardRouter = require('./server/dashboard')
const apiRouter = require('./server/api')
const path = require('path')
const { response } = require('express')
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const cors = require('cors')

app.use(session({
    secret: "helloworld",
    saveUninitialized: true,

    resave: false
}));
//axios.defaults.withCredentials = true
app.use('/router', router)
app.use('/dashboard', dashboardRouter)
app.use('/api', apiRouter)
app.use(cors())
app.use(bodyParser.json())
app.use(express.json());
app.use(cookieParser());
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {


    if(req.session.passport == undefined){
        res.render('index')
    } else {
        res.render('index_data', { data: req.session.passport })
    }


})

let edpuzzleData
app.post('/edpuzzle/token', (req, res) => {
    const token = req.body.token

    // axios.get('https://edpuzzle.com/api/v3/classrooms/active',{
    //     headers:{"Authorization":`Bearer ${token}`}
    // }).then(data => console.log(data))

    fetch('https://edpuzzle.com/api/v3/classrooms/active', {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    }).then(res => res.json()).then(data => {
        if (data.error) {
            return res.status(400).send("invalid token")
        } else {
            edpuzzleData = data;
            req.session.token = token;
            req.session.valid = true;
            req.session.edpuzzleData = data;

            return res.redirect('/edpuzzle/dashboard')
        }
    })


//C:\Users\tokri\Downloads\edpuzzle\server\public\404\unauthorized.html
})



app.get('/edpuzzle/dashboard', (req, res) => {

    if (!req.session.token) {
        res.status(404).sendFile('notloggedin.html', { root: path.join(__dirname, '/server/public/404')})
    }
    else {
        res.render('dashboard', { edpuzzleData: req.session.edpuzzleData, token: req.session.token, })
    }
    // console.log(edpuzzleData)

})

app.get('/logout', (req, res) => {
    req.session.destroy()

    res.redirect('/')
})

let id;
app.get('/edpuzzle/classroom/:id', (req, res) => {
    id = req.params.id
    fetch(`https://edpuzzle.com/api/v3/assignments/classrooms/${req.params.id}/students?needle=`, {
        headers: {
            "Authorization": `Bearer ${req.session.token}`
        }
    })
        .then(res => res.json()).then(data => {
            console.log(data)
            return res.render('room', { id: req.params.id, token: req.session.token, data: data })

        })

})

app.get('/test', (req, res) => {
    fetch(`https://edpuzzle.com/api/v3/assignments/classrooms/${id}/students?needle=`, {
        headers: {
            "Authorization": `Bearer ${req.session.token}`
        }
    }).then(
        res => res.json()
    ).then(data => res.send(data))
})

app.get('/edpuzzle/room/:classroom_id/:lesson_id', (req, res) => {
    req.session.lesson_id = req.params.lesson_id;
    fetch(`https://edpuzzle.com/api/v3/assignments/classrooms/${req.params.classroom_id}/students?needle=`, {
        headers: {
            "Authorization": `Bearer ${req.session.token}`
        }
    }).then(
        res => res.json()
    ).then(data => res.render('lesson', { classroom_id: req.params.classroom_id, token: req.session.token, data: data, lesson_id: req.params.lesson_id }))
})

app.get('/test2', (req, res) => {
    fetch(`https://edpuzzle.com/api/v3/assignments/classrooms/${id}/students?needle=`, {
        headers: {
            "Authorization": `Bearer ${req.session.token}`
        }
    }).then(
        res => res.json()
    ).then(data => res.send(data))
})

app.get('/lesson_id', (req, res) => {
    res.send({ lesson_id: req.session.lesson_id })
})

app.get('/edpuzzlehax1.mp4', (req, res) => {
    res.sendFile('edpuzzlehax1.mp4', { root: path.join(__dirname, './public') })
})

app.get('/apple-touch-icon.png', (req, res) => {
    res.sendFile('apple-touch-icon.png', { root: path.join(__dirname, './public/favicons') })
})

app.get('/favicon-32x32.png', (req, res) => {
    res.sendFile('favicon-32x32.png', { root: path.join(__dirname, './public/favicons') })
})

app.get('/favicon-16x16.png', (req, res) => {
    res.sendFile('favicon-16x16.png', { root: path.join(__dirname, './public/favicons') })
})

app.get('/site.webmanifest', (req, res) => {
    res.sendFile('site.webmanifest', { root: path.join(__dirname, './public/favicons') })
})


app.post('/edpuzzle/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    let setCookie;
    let cookieHeader;
    console.log(username, password)

    fetch('https://edpuzzle.com/api/v3/csrf').then((response) => {
        const arr = [...response.headers]
        setCookie = arr[11][1]
        cookieHeader = setCookie.slice(0, 37)

        //console.log(arr)
        console.log(cookieHeader)


        //axios.get('http://localhost:3000/edpuzzle/csrf')
        //note to self, get the aws-waf-token to set to header


        // axios.post('https://edpuzzle.com/api/v3/users/login', { username: username, password: password, role:"student"}, {

        //     headers:{
        //         'x-csrf-token':`${set.CSRFToken}`,
        //         "Cookie": `${cookieHeader};`,
        //         "Content-Type":"application/json",
        //         "User-Agent":"insomnia/2022.6.0",
        //         "Accept":"*/*"
        //     }
        // }).catch(e => {
        //     console.log(e)
        // })


        axios.get(`${host}/edpuzzle/csrf`)
            .then(get => {

                //console.log(get.data)

                axios.post('https://edpuzzle.com/api/v3/users/login', {
                    username: username,
                    password: password,
                    "role": "student"
                }, {

                    headers: {
                        'x-csrf-token': "d0L8Xm4e-qUJs_E82-MvjA4k6LzHWXeK3kM8",
                        "user-agent": 'insomnia/2022.6.0',
                        Cookie: "edpuzzleCSRF=QQPFHjyRfWb4FBzALAXM8LBj;"
                    }
                })
                    .then(lol => {
                        //console.log(lol.headers.authorization.slice(7))
                        const token = lol.headers.authorization.slice(7)
                        fetch('https://edpuzzle.com/api/v3/classrooms/active', {
                            headers: {
                                "Authorization": `Bearer ${token}`
                            }
                        }).then(res => res.json()).then(data => {
                            if (data.error) {
                                return res.status(400).send("invalid token")
                            } else {
                                edpuzzleData = data;
                                req.session.token = token;
                                req.session.valid = true;
                                req.session.edpuzzleData = data;

                                return res.redirect('/edpuzzle/dashboard')
                            }
                        })



                    })

            })
        

    })






})

app.get('/edpuzzle/info', (req, res) => {
    res.render('edpuzzleInfo')
})

app.get('/edpuzzle/csrf', (req, res) => {

    fetch('https://edpuzzle.com/api/v3/csrf').then(res => res.json())
        .then(data => res.send(data))
})

app.get('/kahoot/info', (req, res) => {
    if(!req.session.passport){
        res.status(400).send("<a href=/router/discord>Login with discord to get access to the kahoot hack!</a>")
    } else {
        res.render('kahootInfo')
    }
    
})


app.post('/kahoot/uuid', (req, res) => {
    const uuid = req.body.uuid;

    fetch(`https://play.kahoot.it/rest/kahoots/${uuid}`).then((response) => {
        if (response.ok) {
            return response.json();
        }

        return res.status(400).send("Invalid Kahoot quizid")
    })
        .then((responseJson) => {
            // Do something with the response

            req.session.kahootData = responseJson
            //console.log(req.session.kahootData)
            return res.render('kahootRoom')
        })
        .catch((error) => {
            console.log(error)
        })



})

app.get('/kahoot/data', (req, res) => {
    res.send(req.session.kahootData)
})


app.get('/quizlet/info', (req, res) => {

    if(!req.session.passport){
        res.status(400).send("<a href=/router/discord>Login with discord to get access to the quizlet live hack!</a>")
    } else {
        res.render('quizlet')
    }
    

           
})

app.post('/quizlet/code', (req, res) => {
    const quizletCode = req.body.quizlet_code

    const finalCode = quizletCode.slice(0,3) + quizletCode.slice(4)
    console.log(finalCode)

 
        fetch(`https://quizlet.com/webapi/3.8/multiplayer/game-instance?gameCode=${finalCode}`)
        .then(response => response.json()).then(stuff => {
            
            req.session.quizletWebsite = stuff.gameInstance.itemId

            res.render('quizlet_data')
        })
  
   
})

app.get('/quizziz/info', (req, res) => {
    if(req.session.passport){
        fetch(`https://discord.com/api/v10/guilds/1039724305795252295/members/${req.session.passport.user.user}`, {
            headers:{
                'Content-Type': 'application/json',
                'Authorization': `Bot ${config.token}`
            }
        }).then(response => response.json())
        .then(data => {
            const filter = data.roles.filter(role => role == "1044668796771782716")
    
            if(filter.length == 0){
    
                
                //return res.send({ premium: false })
    
                return res.send("You do not have premium get it <a href=https://patreon.com/DomK>Here</a>")
    
            } else {
                return res.render('quizziz')
                //return res.send({ role: filter, premium: true })
            }
            
        })
    } else {
        return res.send("Not logged in with <a href=/router/discord>Discord</a>")
    }

   

    
})

app.post('/quizziz/code', (req, res) => {
    const code = req.body.quizziz_code

    fetch(`https://api.quizit.online/quizizz/answers?pin=${code}`)
    .then(response => response.json())
    .then(data => {
        if(data.message == "Room not found"){
            return res.status(400).send("Invalid quizziz game")
        } else {
            
        req.session.quizzizData = data

        res.render('quizziz_data')
        }
    })
})


app.get('/quizlet/api/data', (req, res) => {
   
    res.send({  website: req.session.quizletWebsite })
})


app.get('/quizziz/api/data', (req, res) => {
    res.send(req.session.quizzizData)
})

app.listen(process.env.PORT || 3000, () => {
    console.log('http://localhost:3000')
})
