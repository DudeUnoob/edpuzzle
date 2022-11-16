//https://discord.com/api/oauth2/authorize?client_id=1039205411934453831&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Frouter%2Fapi%2Fv1%2Fdiscord&response_type=code&scope=identify%20email%20guilds%20connections
const passport = require('passport')
const { Strategy } = require('passport-discord')
const host = "https://puzzlehax.ml"
const localHost = "http://localhost:3000"
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));


// clientID:"1039205411934453831",
//clientSecret:"ADstjN5W1xReD-5pAgma42BbA-cgFVj4"
//redirectURL:http://localhost:3000/router/api/auth/redirect

passport.serializeUser((user, done) => {
    // console.log(user)
    //{ user: user.id, username: user.username, avatar: user.avatar, discriminator: user.discriminator, user.email, user.accessToken }
   
    done(null, { user: user.id, username: user.username, avatar: user.avatar, discriminator: user.discriminator, email: user.email, accessToken: user.accessToken })
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
        clientSecret: "ADstjN5W1xReD-5pAgma42BbA-cgFVj4",
        callbackURL: `${localHost}/router/api/auth/redirect`,
        scope: ['identify', 'email', 'guilds', 'guilds.join']


    },
        async (accessToken, refreshToken, profile, done) => {
            const params = new URLSearchParams()
            params.append('client_id', "1039205411934453831")
            params.append('client_secret', "ADstjN5W1xReD-5pAgma42BbA-cgFVj4")
            params.append('grant_type', "refresh_token")
            params.append('refresh_token', refreshToken)
            console.log(accessToken, refreshToken)
            

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
            // console.log(puzzleHaxFilter)

            if (puzzleHaxFilter.length == 0) {
                const guildJoinParams = new URLSearchParams()
                guildJoinParams.append("access_token",accessToken)
                fetch(`https://discord.com/api/v10/guilds/1039724305795252295/members/${profile.id}`, {
                    method:"put",
                    body:JSON.stringify({
                        access_token:accessToken
                    }),
                    headers:{
                        'Content-Type': 'application/json',
                        'Authorization': `Bot MTAzOTIwNTQxMTkzNDQ1MzgzMQ.Gacq7G.snc-vYrCMwJKtIAx_Xkgn3iLwoajThunCA7s9M`
                    }
                }).then(res => res.json())
                .then(data => console.log(data))

                return done(null, profile)
            }

            try {
                return done(null, profile)
            }
            catch (err) {
                return done(err, null)
            }
        }

    )
)