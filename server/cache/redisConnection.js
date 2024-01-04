const { createClient } = require("redis");
const { redisURL } = require('../config/config.json')

const client = createClient({ url: process.env.REDIS_URL || redisURL });

client.on("error", (err) => console.log(err));

client.connect()
    .then(() => console.log("connected to redis"))
    .catch(err => console.error("Failed to connect:", err));

module.exports = client;
