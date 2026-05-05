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

// 🔥 LOAD ALL POKEMON FROM /data
const pokemon = {};

fs.readdirSync("./data").forEach(folder => {
  try {
    const files = fs.readdirSync(`./data/${folder}`)
      .filter(f => f.endsWith(".png"));

    if (files.length === 0) return;

    pokemon[folder.toLowerCase()] = {
      name: folder,
      sets: files.map(file =>
        `https://raw.githubusercontent.com/royalngr2216/Pokemon-bot/main/data/${folder}/${file}`
      )
    };
  } catch {}
});

// ✅ DEBUG LOG
console.log("Loaded Pokemon:", Object.keys(pokemon));

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

function showdownGif(name) {
  return `https://play.pokemonshowdown.com/sprites/xyani/${name.toLowerCase()}.gif`;
}

// 🚀 REGISTER COMMAND
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
          required: true,
          autocomplete: true
        }
      ]
    }
  ]);
});

// 🔁 INTERACTIONS
client.on("interactionCreate", async interaction => {

  // 🔍 AUTOCOMPLETE
  if (interaction.isAutocomplete()) {
    const focused = interaction.options.getFocused().toLowerCase();

    const choices = Object.keys(pokemon);

    const filtered = choices
      .filter(name => name.includes(focused))
      .slice(0, 25);

    return interaction.respond(
      filtered.map(name => ({
        name: pokemon[name].name,
        value: name
      }))
    );
  }

  // 🎯 COMMAND
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "pokemon") {

      await interaction.deferReply();

      const input = interaction.options.getString("name").toLowerCase();
      const mon = pokemon[input];

      if (!mon) return interaction.editReply("Pokemon not found.");

      const images = mon.sets;

      const embed = new EmbedBuilder()
        .setTitle(mon.name.toUpperCase())
        .setColor(0x2b2d31)
        .setThumbnail(showdownGif(mon.name))
        .setImage(images[0])
        .setFooter({ text: `1 / ${images.length}` });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`prev_${input}`)
          .setEmoji("⬅️")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`next_${input}`)
          .setEmoji("➡️")
          .setStyle(ButtonStyle.Secondary)
      );

      await interaction.editReply({
        embeds: [embed],
        components: [row]
      });
    }
  }

  // 🔁 BUTTONS
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

// 🔐 LOGIN
client.login(process.env.TOKEN);
