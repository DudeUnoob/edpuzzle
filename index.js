const express = require('express')
const bodyParser = require("body-parser")
const app = express()
const axios = require('axios')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const path = require('path')
const { response } = require('express')
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const cors = require('cors')
app.use(session({
    secret: "helloworld",
    saveUninitialized: true,

    resave: false
}));

app.use(cors())
app.use(bodyParser.json())
app.use(express.json());
app.use(cookieParser());
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {


    res.render('index')


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

            return res.redirect('/dashboard')
        }
    })



})

app.get('/dashboard', (req, res) => {

    if (!req.session.token) {
        res.status(400).send("Please <a href=/>login</a> with your edpuzzle token")
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

    console.log(username, password)

    fetch('http://localhost:443')
        .then(ok => ok.json())
        .then(get => {

            fetch('http://localhost:443/login', {
                method:"post",
                body:JSON.stringify({
                    username: username,
                    password: password,
                    role:"student"
                })
            })
        })



})

app.get('/edpuzzle/info', (req, res) => {
    res.render('edpuzzleInfo')
})

app.get('/kahoot/info', (req, res) => {
    res.render('kahootInfo')
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




app.listen(process.env.PORT || 3000, () => {
    console.log('http://localhost:3000')
})
