const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const fs = require("fs");

const data = JSON.parse(fs.readFileSync("./pokemon.json"));

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once("ready", async () => {
  console.log("Bot Online!");

  await client.application.commands.create({
    name: "gengar",
    description: "Show beautiful Gengar competitive sets"
  });
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "gengar") {
    const gengar = data.gengar;

    const embed = new EmbedBuilder()
      .setTitle("👻 Gengar — Competitive Sets")
      .setColor(0x8e44ad)
      .setThumbnail(gengar.image)
      .setFooter({ text: "Your personal Pokédex bot" });

    gengar.sets.forEach(set => {
      embed.addFields({
        name: `✨ ${set.name}`,
        value:
          `🧢 **Item:** ${set.item}\n` +
          `🧬 **Ability:** ${set.ability}\n` +
          `📊 **EVs:** ${set.evs}\n` +
          `🌿 **Nature:** ${set.nature}\n` +
          `⚔️ **Moves:**\n• ${set.moves.join("\n• ")}`,
        inline: true
      });
    });

    await interaction.reply({ embeds: [embed] });
  }
});

client.login(process.env.TOKEN);
