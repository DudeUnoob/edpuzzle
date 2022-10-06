const express = require('express')
const bodyParser = require("body-parser")
const app = express()
const axios = require('axios')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const path = require('path')
const fetch = require('cross-fetch')
app.use(session({
    secret: "helloworld",
    saveUninitialized:true,
    
    resave: false 
}));
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

    fetch('https://edpuzzle.com/api/v3/classrooms/active',{
        headers:{
            "Authorization":`Bearer ${token}`
        }
    }).then(res => res.json()).then(data => {
        if(data.error){
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
    
   // console.log(edpuzzleData)
    res.render('dashboard', { edpuzzleData: req.session.edpuzzleData, token: req.session.token,  })
})

let id;
app.get('/edpuzzle/classroom/:id', (req, res) => {
    id=req.params.id
    fetch(`https://edpuzzle.com/api/v3/assignments/classrooms/${req.params.id}/students?needle=`,{
        headers:{
            "Authorization":`Bearer ${req.session.token}`
        }
    })
    .then(res => res.json()).then(data => {
        console.log(data)
        return res.render('room', { id: req.params.id, token: req.session.token, data: data})

    })

})

app.get('/test',(req, res) => {
    fetch(`https://edpuzzle.com/api/v3/assignments/classrooms/${id}/students?needle=`,{
        headers:{
            "Authorization":`Bearer ${req.session.token}`
        }
    }).then(
        res => res.json()
       ).then(data => res.send(data))
})

app.get('/edpuzzle/room/:classroom_id/:lesson_id', (req, res) => {
    req.session.lesson_id = req.params.lesson_id;
    fetch(`https://edpuzzle.com/api/v3/assignments/classrooms/${req.params.classroom_id}/students?needle=`, {
        headers:{
            "Authorization":`Bearer ${req.session.token}`
        }
    }).then(
        res => res.json()
    ).then(data => res.render('lesson', { classroom_id: req.params.classroom_id, token: req.session.token, data: data, lesson_id: req.params.lesson_id}))
})

app.get('/test2', (req, res) => {
    fetch(`https://edpuzzle.com/api/v3/assignments/classrooms/${id}/students?needle=`,{
        headers:{
            "Authorization":`Bearer ${req.session.token}`
        }
    }).then(
        res => res.json()
       ).then(data => res.send(data))
})

app.get('/lesson_id',(req, res) => {
    res.send({ lesson_id: req.session.lesson_id})
})

app.get('/edpuzzlehax1.mp4',(req, res) => {
    res.sendFile('edpuzzlehax1.mp4',{ root: path.join(__dirname,'./public')})
})

app.listen(process.env.PORT || 3000, () => {
    console.log('http://localhost:3000')
})
