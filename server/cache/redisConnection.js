const { createClient } = require("redis");

const client = createClient({ url: "" });

client.on("error", (err) => console.log(err));

client.connect()
    .then(() => console.log("connected to redis"))
    .catch(err => console.error("Failed to connect:", err));

module.exports = client;
