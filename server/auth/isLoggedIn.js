

async function isLoggedIn(req, res, next) {

    req.session.passport ? next() : res.status(400).send("<a href=/router/discord>Login with discord to get access!</a>")
}

module.exports = isLoggedIn