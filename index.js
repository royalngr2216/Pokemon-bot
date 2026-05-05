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

// 🔥 LOAD POKEMON FROM /data
const pokemon = {};

fs.readdirSync("./data").forEach(folder => {
  try {
    const files = fs.readdirSync(`./data/${folder}`)
      .filter(f => f.includes(".png"));

    if (files.length === 0) return;

    pokemon[folder.toLowerCase()] = {
      name: folder,
      sets: files.map(file =>
        `https://raw.githubusercontent.com/royalngr2216/pokemon-bot/main/data/${folder}/${file}`
      )
    };
  } catch {}
});

// 🧪 DEBUG
console.log("Loaded Pokemon:", Object.keys(pokemon));

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

function showdownGif(name) {
  return `https://play.pokemonshowdown.com/sprites/xyani/${name.toLowerCase()}.gif`;
}

// 🚀 READY
client.once("clientReady", async () => {
  console.log("Bot Online");

  await client.application.commands.set([
    {
      name: "pokemon",
      description: "View Pokémon sets",
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

// 🎯 MAIN INTERACTION
client.on("interactionCreate", async interaction => {

  // 🔍 AUTOCOMPLETE
  if (interaction.isAutocomplete()) {
    const focused = interaction.options.getFocused().toLowerCase();

    const filtered = Object.keys(pokemon)
      .filter(name =>
        name.startsWith(focused) || name.includes(focused)
      )
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

      if (!mon) {
        return interaction.editReply({
          content: "❌ Pokémon not found. Try using autocomplete."
        });
      }

      let page = 0;
      const images = mon.sets;

      const embed = new EmbedBuilder()
        .setTitle(`⚔️ ${mon.name.toUpperCase()} Sets`)
        .setDescription(`Competitive Pokémon sets\n\nUse ⬅️ ➡️ to browse`)
        .setColor(0x5865F2)
        .setThumbnail(showdownGif(mon.name))
        .setImage(images[page])
        .setFooter({
          text: `Set ${page + 1} of ${images.length}`,
          iconURL: interaction.user.displayAvatarURL()
        })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`first_${input}`)
          .setEmoji("⏪")
          .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
          .setCustomId(`prev_${input}`)
          .setEmoji("⬅️")
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId(`next_${input}`)
          .setEmoji("➡️")
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId(`last_${input}`)
          .setEmoji("⏩")
          .setStyle(ButtonStyle.Secondary)
      );

      await interaction.editReply({
        embeds: [embed],
        components: [row]
      });
    }
  }

  // 🔁 BUTTON HANDLER
  if (interaction.isButton()) {
    const [action, name] = interaction.customId.split("_");

    const mon = pokemon[name];
    const images = mon.sets;

    let page =
      parseInt(interaction.message.embeds[0].footer.text.split(" ")[1]) - 1;

    if (action === "next") page++;
    if (action === "prev") page--;
    if (action === "first") page = 0;
    if (action === "last") page = images.length - 1;

    if (page < 0) page = images.length - 1;
    if (page >= images.length) page = 0;

    const embed = EmbedBuilder.from(interaction.message.embeds[0])
      .setImage(images[page])
      .setFooter({
        text: `Set ${page + 1} of ${images.length}`,
        iconURL: interaction.user.displayAvatarURL()
      });

    await interaction.update({
      embeds: [embed]
    });
  }
});

// 🔐 LOGIN
client.login(process.env.TOKEN);
