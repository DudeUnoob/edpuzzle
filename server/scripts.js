const express = require("express")
const scriptsRouter = express.Router()
const path = require("path")

const scriptsFileDir = { root: path.join(__dirname, './public/scripts' )}

scriptsRouter.get("/kahootsearch.js", (req, res) => {
    res.sendFile('kahootSearch.js', scriptsFileDir)
})

module.exports = scriptsRouter