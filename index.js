const express = require("express");
const app = express();

app.get("/", (req, res) => res.send("Bot is alive"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Web server ready"));

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");
const fs = require("fs");

const pokemon = JSON.parse(fs.readFileSync("./pokemon.json"));

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

function showdownGif(name) {
  return `https://play.pokemonshowdown.com/sprites/xyani/${name}.gif`;
}

async function registerCommands() {
  await client.application.commands.set([
    {
      name: "pokemon",
      description: "View Pokémon",
      options: [
        {
          name: "name",
          description: "Pokemon name",
          type: 3,
          required: true
        }
      ]
    },
    {
      name: "ping",
      description: "Check bot status"
    }
  ]);
}

client.once("ready", async () => {
  console.log("Bot Online");
  await registerCommands();
});

client.on("interactionCreate", async interaction => {

  // /ping
  if (interaction.isChatInputCommand() && interaction.commandName === "ping") {
    const latency = Date.now() - interaction.createdTimestamp;
    return interaction.reply(`${latency} ms\nBot is Online!`);
  }

  // /pokemon
  if (interaction.isChatInputCommand() && interaction.commandName === "pokemon") {

    await interaction.deferReply(); // ⬅️ prevents timeout

    const name = interaction.options.getString("name").toLowerCase();
    const mon = pokemon[name];

    if (!mon)
      return interaction.editReply("Pokemon not found.");

    const images = mon.sets || [];

    if (images.length === 0)
      return interaction.editReply("No sets added yet for this Pokémon.");

    const embed = new EmbedBuilder()
      .setTitle(name.toUpperCase())
      .setColor(0x2b2d31)
      .setThumbnail(showdownGif(name))
      .setImage(images[0])
      .setFooter({ text: `1 / ${images.length}` });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`prev_${name}`)
        .setEmoji("⬅️")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(`next_${name}`)
        .setEmoji("➡️")
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.editReply({ embeds: [embed], components: [row] });
  }

  // buttons
  if (interaction.isButton()) {
    const [action, name] = interaction.customId.split("_");
    const mon = pokemon[name];
    const images = mon.sets || [];

    let page = parseInt(interaction.message.embeds[0].footer.text.split(" ")[0]) - 1;

    if (action === "next") page++;
    if (action === "prev") page--;

    if (page < 0) page = images.length - 1;
    if (page >= images.length) page = 0;

    const embed = EmbedBuilder.from(interaction.message.embeds[0])
      .setImage(images[page])
      .setFooter({ text: `${page + 1} / ${images.length}` });

    await interaction.update({ embeds: [embed] });
  }
});

console.log("TOKEN CHECK:", process.env.TOKEN ? "FOUND" : "MISSING");
client.login(process.env.TOKEN);