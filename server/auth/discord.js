//https://discord.com/api/oauth2/authorize?client_id=1039205411934453831&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Frouter%2Fapi%2Fv1%2Fdiscord&response_type=code&scope=identify%20email%20guilds%20connections
const passport = require('passport')
const { Strategy } = require('passport-discord')
const host = "https://unpuzzle.org"
const localHost = "http://localhost:3000"
const localIp = "http://192.168.86.235:3000"
const replHost = "https://edpuzzle.dudeunoob.repl.co"
const { routerHost } = require("../config/config.json")
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const config = require('../config/botconfig.json')


// clientID:"1039205411934453831",
//clientSecret:"ADstjN5W1xReD-5pAgma42BbA-cgFVj4"
//redirectURL:http://localhost:3000/router/api/auth/redirect

passport.serializeUser((user, done) => {
    // console.log(user)
    //{ user: user.id, username: user.username, avatar: user.avatar, discriminator: user.discriminator, user.email, user.accessToken }
   
    done(null, { user: user.id, username: user.username, avatar: user.avatar, discriminator: user.discriminator, email: user.email, accessToken: user.accessToken, verified: user.verified, locale: user.locale, connections: user.connection, emails: user.emails
    ,name: user.displayName, provider: user.provider
    })
})


passport.deserializeUser(async (user, done) => {

    try {
        done(null, user)
    }
    catch (err) {
        done(err, null)
    }
})
passport.use(
new Strategy({
    clientID: "1039205411934453831",
    clientSecret: "mDwqeKHbicyRg_qjK6kleQO4N0Y4jt1P",
    callbackURL: `${routerHost}/router/api/auth/redirect`,
    scope: ['identify', 'email', 'guilds', 'guilds.join']


},
    async (accessToken, refreshToken, profile, done) => {
        //name, verified, locale, emails, connections maybe,
        const params = new URLSearchParams()
        params.append('client_id', "1039205411934453831")
        params.append('client_secret', "mDwqeKHbicyRg_qjK6kleQO4N0Y4jt1P")
        params.append('grant_type', "refresh_token")
        params.append('refresh_token', refreshToken)
        
        

        //  fetch('https://discord.com/api/v10/oauth2/token',{
        //     method:"post",
        //     body:params,
        //     headers:{
        //         'Content-Type': 'application/x-www-form-urlencoded'
        //     }
        //  }).then(res => res.json())
        //  .then(data => {
        //     console.log(data)

        //     fetch('https://discord.com/api/users/@me', {
        //         headers: {
        //             authorization: `Bearer ${data.access_token}`
        //         }
        //     }).then(lol => lol.json()).then(set => console.log(set))
        //  })
        

        //console.log(profile.guilds)
        const puzzleHaxFilter = profile.guilds.filter((elm) => elm.id == "1039724305795252295")
         

        if (puzzleHaxFilter.length == 0) {
            const guildJoinParams = new URLSearchParams()
            guildJoinParams.append("access_token",accessToken)
            

            return done(null, profile)
        }

        try {
            return done(null, profile)
        }
        catch (err) {
            console.log(err, "There was an error")
            return done(err, null)
        }
    }

)
)



    



