const express = require('express')
const bodyParser = require("body-parser")
const config = require('./server/config/botconfig.json')
const app = express()
const axios = require('axios')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const replHost = "https://edpuzzle.dudeunoob.repl.co"
let host = 'https://unpuzzle.org'
const localhost = 'http://localhost:3000'
const { routerHost } = require("./server/config/config.json")
const router = require('./server/router')
const passport = require('passport')
const dashboardRouter = require('./server/dashboard')
const apiRouter = require('./server/api')
const path = require('path')
const WebSocket = require("ws")
const { response } = require('express')
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const cors = require('cors')
const scriptsRouter = require("./server/scripts")
const isLoggedIn = require('./server/auth/isLoggedIn')
const client = require('./server/cache/redisConnection')
const getQueryParamByName = require("./server/functions/getQueryParamByName")
app.use(session({
    secret: "helloworld",
    saveUninitialized: true,

    resave: false
}));

//axios.defaults.withCredentials = true
app.use('/router', router)
app.use('/v1/public/scripts', scriptsRouter)
app.use('/dashboard', dashboardRouter)
app.use('/api', apiRouter)
app.use(cors())
app.use(bodyParser.json())
app.use(express.json());
app.use(cookieParser());
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    if (req.session.passport == true) {
        req.session.destroy()
        res.redirect('/')
    }

    if (req.session.passport == undefined) {
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
        res.status(404).sendFile('notloggedin.html', { root: path.join(__dirname, '/server/public/404') })
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
            if (data.errorCode) {
                return res.redirect('/')
            } else {
                return res.render('room', { id: req.params.id, token: req.session.token, data: data })
            }

        })

})

app.get('/test', async (req, res) => {
    fetch(`https://edpuzzle.com/api/v3/assignments/classrooms/${id}/students?needle=`, {
        headers: {
            "Authorization": `Bearer ${req.session.token}`
        }
    }).then(
        res => res.json()
    ).then(data => res.send(data))
})

app.get('/edpuzzle/room/:classroom_id/:lesson_id', async (req, res) => {
    req.session.lesson_id = req.params.lesson_id;


    fetch(`https://edpuzzle.com/api/v3/assignments/classrooms/${req.params.classroom_id}/students?needle=`, {
        headers: {
            "Authorization": `Bearer ${req.session.token}`
        }
    }).then(
        res => res.json()
    ).then(data => res.render('lesson', { classroom_id: req.params.classroom_id, token: req.session.token, data: data, lesson_id: req.params.lesson_id }))
})

app.post("/edpuzzle/set_attempt_id", async (req, res) => {
    const attempt_id = req.body.attempt_id
    const key_id = req.body.key_id

    req.session.attempt_id = attempt_id
    req.session.key_id = key_id

    res.json({ message: "Set the ATTEMPT_ID and the KEY_ID" })

})

app.get("/edpuzzle/get_attempt_id", (req, res) => {
    res.json({ attempt_id: req.session.attempt_id })
})

app.post('/edpuzzle/set_teacher_assignment_id', async (req, res) => {
    req.session.teacherAssignmentMediaId = req.body.teacherAssignmentMediaId

    res.status(200).json({ teacherAssignmentMediaId: req.body.teacherAssignmentMediaId })

})

app.get('/edpuzzle/get_teacher_assignment_id', (req, res) => {

    res.status(200).json({ teacherAssignmentMediaId: req.session.teacherAssignmentMediaId })
})

app.get('/test2', async (req, res) => {
    try {
        const cachedLessonData = await client.json.get(req.session.lesson_id);

        if (cachedLessonData) {
            console.log("Send redis cached data");
            return res.status(200).send(cachedLessonData);
        }

        const apiUrl = `https://www.unpuzzle.net/_next/data/t41KPPLry9XjCurY9vmZT/answers/${req.session.key_id}.json?userToken=${req.session.token}&contentId=${req.session.key_id}`;
        
        const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
        });

        const responseData = await response.json();

        if (responseData.error) {
            return res.status(400).send({
                error: "Error occurred",
                message: "Most likely happened due to session of KEY_ID was undefined",
                statusCode: 400
            });
        }

        const cacheResult = await client.json.set(req.session.lesson_id, "$", responseData, { NX: true });

        if (cacheResult === "OK") {
            await client.expire(req.session.lesson_id, 300);
        }

        res.status(200).send(responseData);

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});



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

    // fetch('https://edpuzzle.com/api/v3/csrf').then((response) => {
    //     const arr = [...response.headers]
    //     setCookie = arr[11][1]
    //     cookieHeader = setCookie.slice(0, 37)

    //     //console.log(arr)
    //     console.log(cookieHeader)


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


    axios.get(`${routerHost}/edpuzzle/csrf`)
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


    // })






})

app.get('/edpuzzle/info', (req, res) => {
    if (req.session.token) {
        res.redirect('/edpuzzle/dashboard')
    } else {
        res.render('edpuzzleInfo')
    }

})

app.get('/edpuzzle/csrf', (req, res) => {

    fetch('https://edpuzzle.com/api/v3/csrf').then(res => res.json())
        .then(data => res.send(data))
})

app.get('/kahoot/info', isLoggedIn, (req, res, next) => {
    res.render('kahootInfo')
})


app.post('/kahoot/uuid', async (req, res) => {
    const uuid = req.body.uuid;
    let endpointUrl;
    let cacheKey;

    const fetchKahootData = async (url) => {
        try {
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            throw error;
        }
    };

    if (uuid.startsWith("https")) {
        const challengeId = getQueryParamByName(uuid, 'challenge-id');
        endpointUrl = `https://create.kahoot.it/rest/challenges/${challengeId}?includeKahoot=true`;
        cacheKey = challengeId;
    } else {
        endpointUrl = `https://create.kahoot.it/rest/kahoots/${uuid}/card/?includeKahoot=true`;
        cacheKey = uuid;
    }

    try {
        let kahootData = await client.json.get(cacheKey);

        if (!kahootData) {
            const fetchedData = await fetchKahootData(endpointUrl);
            const { title, questions } = fetchedData.kahoot;
            await client.json.set(cacheKey, "$", { title, questions }, { NX: true });
            await client.expire(cacheKey, 300);
            kahootData = { kahoot: { title, questions } }; // Update kahootData structure for subsequent use
        } else {
            
            req.session.kahootData = kahootData

            res.render('kahootRoom');
        }


    } catch (error) {
        res.send(error);
    }
});


app.get('/kahoot/data', (req, res) => {
    res.send(req.session.kahootData)
})


app.get('/quizlet/info', isLoggedIn, (req, res) => {


    res.render('quizlet')

})

app.post('/quizlet/code', (req, res) => {
    const quizletCode = req.body.quizlet_code

    const finalCode = quizletCode.slice(0, 3) + quizletCode.slice(4)


    fetch(`https://quizlet.com/webapi/3.8/multiplayer/game-instance?gameCode=${finalCode}`,
        {
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(response => response.json()).then(stuff => {

            req.session.quizletWebsite = stuff.gameInstance.itemId

            res.send(stuff)
        })
        .catch(error => {
            res.status(400).send({ message: "Your game couldn't be found!" })
        })


})

app.get('/kahoot/room/:quizId', isLoggedIn, (req, res) => {
    fetch(`https://api.quizit.online/kahoot/answers?quizId=${req.params.quizId}`)
        .then(response => response.json())
        .then(data => {
            req.session.kahootData = data

            return res.render('kahootSearchedRoom')
        })
})

app.get('/quizlet/accept', (req, res) => {
    res.render("quizlet_data")
})

app.get('/quizziz/info', (req, res) => {
    if (req.session.passport == true) {
        return res.render('quizziz')
    }
    if (req.session.passport) {
        fetch(`https://discord.com/api/v10/guilds/1039724305795252295/members/${req.session.passport.user.user}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bot ${config.token}`
            }
        }).then(response => response.json())
            .then(data => {
                const filter = data.roles.filter(role => role == "1044668796771782716")

                if (filter.length == 0) {


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
            if (data.message == "Room not found") {
                return res.status(400).send("Invalid quizziz game")
            } else {

                req.session.quizzizData = data

                res.render('quizziz_data')
            }
        })
})


app.get('/quizlet/api/data', (req, res) => {

    res.send({ website: req.session.quizletWebsite })
})


app.get('/quizziz/api/data', (req, res) => {
    res.send(req.session.quizzizData)
})

app.get('/kahoot/search', isLoggedIn, (req, res) => {
    res.render("kahootSearch")
})

app.get('/test/route', (req, res) => {
    res.render('test')
})

app.get('/access', (req, res) => {
    req.session.passport = true
    res.render('access')
})

app.listen(process.env.PORT || 3000, () => {
    console.log('http://localhost:3000')
})
