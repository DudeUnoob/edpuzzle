
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function premiumUser(req, res, next) {
  fetch(`https://discord.com/api/v10/guilds/1039724305795252295/members/${req.session.passport.user.user}`, {
      headers:{
          'Content-Type': 'application/json',
          'Authorization': `Bot ${config.token}`
      }
  }).then(response => response.json())
  .then(data => {
      const filter = data.roles.filter(role => role == "1044668796771782716")

      if(filter.length == 0){


          return res.status(400).send({ premium: false })

      } else {

          next()
      }

  })
  .catch((error) => {
    return res.status(400).send({ premium: false })
  })
}

module.exports = premiumUser