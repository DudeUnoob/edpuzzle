const express = require('express')
const dashboardRouter = express.Router()
const path = require('path')

const dashboardDirectory = { root: path.join(__dirname, '../views/dashboard')}
const dashboardCssDirectory = { root: path.join(__dirname, './public/css')}
const dashboard404StatusCodeDirectory = { root: path.join(__dirname, './public/404')}
dashboardRouter.get('/main_dashboard', (req, res) => {
    if(!req.session.passport){
        return res.status(400).sendFile('unauthorized.html', dashboard404StatusCodeDirectory)
    } else {
    res.sendFile('main_dashboard.html', dashboardDirectory)

    }
})

dashboardRouter.get('/main_dashboard.css', (req, res) => {
    res.sendFile('main_dashboard.css', dashboardCssDirectory)
})

dashboardRouter.get('/user.css', (req, res) => {
    res.sendFile('user.css', dashboardCssDirectory)
})

dashboardRouter.get('/user', (req, res) => {
    res.sendFile('user.html', dashboardDirectory )
})
module.exports = dashboardRouter;