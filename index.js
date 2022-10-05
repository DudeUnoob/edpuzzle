const express = require('express')
const bodyParser = require("body-parser")
const app = express()
const axios = require('axios')
const cookieParser = require('cookie-parser')
const session = require('express-session')

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

app.get('/edpuzzle/classroom/:id', (req, res) => {
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
    fetch(`https://edpuzzle.com/api/v3/assignments/classrooms/61201fec13837941596648da/students?needle=`,{
        headers:{
            "Authorization":`Bearer ${req.session.token}`
        }
    }).then(
        res => res.json()
       ).then(data => res.send(data))
})

app.listen(3000, () => {
    console.log('http://localhost:3000')
})
