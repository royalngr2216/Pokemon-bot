require("dotenv").config();
const express = require("express");
const app = express();

app.get("/", (req, res) =>
  res.send("Bot is alive")
);

app.listen(
  process.env.PORT || 3000
);

const {
  Client,
  GatewayIntentBits,
  Collection
} = require("discord.js");

const fs = require("fs");

const mongoose =
  require("mongoose");

// =========================
// MONGODB
// =========================

mongoose.connect(
  process.env.MONGO_URI
)

.then(() => {
  console.log(
    "MongoDB Connected"
  );
})

.catch(err => {
  console.log(err);
});

// =========================
// CLIENT
// =========================

const client = new Client({

  intents: [

    GatewayIntentBits.Guilds,

    GatewayIntentBits.GuildMessages,

    GatewayIntentBits.MessageContent,

    GatewayIntentBits.DirectMessages

  ]
});

client.commands =
  new Collection();

// =========================
// LOAD COMMANDS
// =========================

const commandFiles = fs

  .readdirSync("./commands")

  .filter(file =>
    file.endsWith(".js")
  );

for (const file of commandFiles) {

  const command =
    require(`./commands/${file}`);

  client.commands.set(
    command.data.name,
    command
  );
}

// =========================
// LOAD EVENTS
// =========================

const eventFiles = fs

  .readdirSync("./events")

  .filter(file =>
    file.endsWith(".js")
  );

for (const file of eventFiles) {

  const event =
    require(`./events/${file}`);

  event(client);
}

// =========================
// LOAD SYSTEMS
// =========================
require("./systems/tourReminders")(
  client
);

// =========================
// READY
// =========================

client.once(
  "clientReady",

  async () => {

    console.log(
      "Bot Online"
    );

    const commands = [];

    client.commands.forEach(
      cmd => {

        commands.push(
          cmd.data.toJSON()
        );
      }
    );

    await client.application
      .commands.set(commands);

    console.log(
      "Slash commands loaded"
    );
  }
);

// =========================
// LOGIN
// =========================

client.login(
  process.env.TOKEN
);
