const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");

const data = JSON.parse(fs.readFileSync("./pokemon.json"));

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once("ready", async () => {
  console.log("Bot Online!");

  await client.application.commands.create({
    name: "gengar",
    description: "Show Gengar movesets"
  });
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "gengar") {
    const sets = data.gengar;

    let reply = "**Gengar Sets:**\n\n";

    sets.forEach(s => {
      reply += `**${s.name}**\nItem: ${s.item}\nMoves: ${s.moves.join(", ")}\n\n`;
    });

    await interaction.reply(reply);
  }
});

client.login(process.env.TOKEN);
