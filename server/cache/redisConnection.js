const { createClient } = require("redis");

const client = createClient({ url: "redis://default:nyaJGHN1JfP87MsY9dJd0dHrckaUoKR4@redis-13764.c326.us-east-1-3.ec2.cloud.redislabs.com:13764" });

client.on("error", (err) => console.log(err));

client.connect()
    .then(() => console.log("connected to redis"))
    .catch(err => console.error("Failed to connect:", err));

module.exports = client;
