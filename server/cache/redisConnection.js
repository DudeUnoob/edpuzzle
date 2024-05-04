const { createClient } = require("redis");
const { redisURL } = require('../config/config.json')

const client = createClient({ url: process.env.REDIS_URL || redisURL });

//(err) => console.log(err)
client.on("error", (err) => {} );

client.connect()
    // .then(() => console.log("connected to redis"))
    // .catch(err => console.error("Failed to connect:", err));

module.exports = client;
