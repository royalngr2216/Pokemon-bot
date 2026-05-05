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

// 🎨 RANDOM COLOR
function getRandomColor() {
  const colors = [
    0x5865F2, 0x57F287, 0xFEE75C, 0xEB459E,
    0xED4245, 0x3498DB, 0x9B59B6, 0x1ABC9C,
    0xE67E22, 0x95A5A6
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// 🔥 LOAD DATA
const pokemon = {};

fs.readdirSync("./data").forEach(folder => {
  try {
    const files = fs.readdirSync(`./data/${folder}`)
      .filter(f => f.toLowerCase().endsWith(".png"));

    if (!files.length) return;

    pokemon[folder.toLowerCase()] = {
      name: folder,
      sets: files.map(file =>
        `https://raw.githubusercontent.com/royalngr2216/pokemon-bot/main/data/${folder}/${file}`
      )
    };
  } catch {}
});

console.log("Loaded Pokemon:", Object.keys(pokemon));

// 🤖 CLIENT (NOW WITH DM SUPPORT)
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages
  ]
});

// GIF
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
      dm_permission: true, // ⭐ THIS ENABLES DM USE
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

// 🎯 INTERACTIONS
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
          content: "❌ Pokémon not found. Try autocomplete."
        });
      }

      let page = 0;
      const images = mon.sets;
      const color = getRandomColor();

      const embed = new EmbedBuilder()
        .setTitle(`⚔️ ${mon.name.toUpperCase()} Sets`)
        .setColor(color)
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

  // 🔁 BUTTONS
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

    const oldEmbed = interaction.message.embeds[0];

    const embed = EmbedBuilder.from(oldEmbed)
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
