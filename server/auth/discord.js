//https://discord.com/api/oauth2/authorize?client_id=1039205411934453831&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Frouter%2Fapi%2Fv1%2Fdiscord&response_type=code&scope=identify%20email%20guilds%20connections
const passport = require('passport')
const { Strategy } = require('passport-discord')


passport.use(
    new Strategy(
        {
        clientID:"1039205411934453831",
        clientSecret:"ADstjN5W1xReD-5pAgma42BbA-cgFVj4",
        callbackURL:'http://localhost:3000/router/api/v1/auth/discord/redirect',
        scope:['identify','email', 'connections'],
    },
    async(accessToken, refreshToken, profile, done) => {
        console.log(accessToken, refreshToken)
        console.log(profile)

        passport.serializeUser((user, done) => {
            console.log("Serializing...")
            console.log(user)
            done(null, user)
        })
        
       

    }
    )
)

passport.deserializeUser(async(id, done) => {
    done(null, user)
})
