//https://discord.com/api/oauth2/authorize?client_id=1039205411934453831&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Frouter%2Fapi%2Fv1%2Fdiscord&response_type=code&scope=identify%20email%20guilds%20connections
const passport = require('passport')
const { Strategy } = require('passport-discord')
const host = "https://puzzlehax.ml"
const localHost = "http://localhost:3000"


// clientID:"1039205411934453831",
//clientSecret:"ADstjN5W1xReD-5pAgma42BbA-cgFVj4"
//redirectURL:http://localhost:3000/router/api/auth/redirect

passport.serializeUser((user, done) => {
    // console.log(user)
    done(null, user)
})

passport.deserializeUser(async (user, done) => {

    try{
        done(null, user)
    }
    catch(err){
        done(err, null)
    }
})

passport.use(
    new Strategy({
        clientID:"1039205411934453831",
        clientSecret:"ADstjN5W1xReD-5pAgma42BbA-cgFVj4",
        callbackURL:`${localHost}/router/api/auth/redirect`,
        scope:['identify','email','guilds','guilds.join']
        
        
    },
    async(accessToken, refreshToken,profile, done) => {
        // console.log(accessToken, refreshToken)
        console.log(profile.guilds)
        const puzzleHaxFilter = profile.guilds.filter((elm) => elm.id == "1039724305795252295")
        // console.log(puzzleHaxFilter)

        if(puzzleHaxFilter.length == 0){
            return done(null, null)
        }

        try {
            return done(null, profile.id)
        }
        catch(err){
            return done(err, null)
        }
    }
    
    )
)