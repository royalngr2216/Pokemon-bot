const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const fs = require("fs");

const { getRandomColor } = require("../utils/colors");

const pokemon = {};

// LOAD POKEMON
fs.readdirSync("./data").forEach(folder => {
  try {
    const files = fs
      .readdirSync(`./data/${folder}`)
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

function showdownGif(name) {
  return `https://play.pokemonshowdown.com/sprites/xyani/${name.toLowerCase()}.gif`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pokemon")
    .setDescription("View Pokémon sets")
    .addStringOption(option =>
      option
        .setName("name")
        .setDescription("Pokemon name")
        .setRequired(true)
        .setAutocomplete(true)
    ),

  pokemon,

  async autocomplete(interaction) {
    const focused =
      interaction.options.getFocused().toLowerCase();

    const filtered = Object.keys(pokemon)
      .filter(name =>
        name.startsWith(focused) ||
        name.includes(focused)
      )
      .slice(0, 25);

    await interaction.respond(
      filtered.map(name => ({
        name: pokemon[name].name,
        value: name
      }))
    );
  },

  async execute(interaction) {

    await interaction.deferReply();

    const input =
      interaction.options.getString("name").toLowerCase();

    const mon = pokemon[input];

    if (!mon) {
      return interaction.editReply({
        content:
          "❌ Pokémon not found. Try autocomplete."
      });
    }

    let page = 0;
    const images = mon.sets;

    const embed = new EmbedBuilder()
      .setTitle(`⚔️ ${mon.name.toUpperCase()} Sets`)
      .setColor(getRandomColor())
      .setThumbnail(showdownGif(mon.name))
      .setImage(images[page])
      .setFooter({
        text: `Set ${page + 1} of ${images.length}`,
        iconURL:
          interaction.user.displayAvatarURL()
      })
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
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
};
