const express = require("express");
const app = express();

app.get("/", (req, res) => res.send("Bot is alive"));
app.listen(process.env.PORT || 3000);

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const fs = require("fs");

// 🔥 AUTO LOAD FROM data/
const pokemon = {};

fs.readdirSync("./data").forEach(folder => {
  try {
    const files = fs.readdirSync(`./data/${folder}`)
      .filter(f => f.endsWith(".png"));

    if (files.length === 0) return;

    pokemon[folder] = {
      sets: files.map(file =>
        `https://raw.githubusercontent.com/royalngr2216/Pokemon-bot/main/data/${folder}/${file}`
      )
    };
  } catch {}
});

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

function showdownGif(name) {
  return `https://play.pokemonshowdown.com/sprites/xyani/${name}.gif`;
}

client.once("ready", async () => {
  console.log("Bot Online");

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
    }
  ]);
});

client.on("interactionCreate", async interaction => {

  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "pokemon") {

      await interaction.deferReply();

      const name = interaction.options.getString("name").toLowerCase();
      const mon = pokemon[name];

      if (!mon) return interaction.editReply("Pokemon not found.");

      const images = mon.sets;

      const embed = new EmbedBuilder()
        .setTitle(name.toUpperCase())
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
  }

  if (interaction.isButton()) {
    const [action, name] = interaction.customId.split("_");

    const mon = pokemon[name];
    const images = mon.sets;

    let page =
      parseInt(interaction.message.embeds[0].footer.text.split(" ")[0]) - 1;

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

client.login(process.env.TOKEN);
