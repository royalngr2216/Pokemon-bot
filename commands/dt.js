const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

const {
  Dex
} = require("pokemon-showdown");

const {
  getRandomColor
} = require("../utils/colors");

module.exports = {

  data: new SlashCommandBuilder()

    .setName("dt")

    .setDescription(
      "Detailed dex information"
    )

    .addStringOption(option =>

      option

        .setName("query")

        .setDescription(
          "Pokemon, move, item, or ability"
        )

        .setRequired(true)
    ),

  async execute(interaction) {

    // =========================
    // DEFER REPLY
    // =========================

    await interaction.deferReply();

    const query =
      interaction.options
        .getString("query");

    // =========================
    // POKEMON
    // =========================

    const pokemon =
      Dex.species.get(query);

    if (pokemon.exists) {

      const embed =
        new EmbedBuilder()

          .setTitle(
            `📘 ${pokemon.name}`
          )

          .setColor(
            getRandomColor()
          )

          .setDescription(

            `### Typing\n` +
            `${pokemon.types.join("/")}\n\n` +

            `### Abilities\n` +
            `${Object.values(
              pokemon.abilities
            ).join(", ")}\n\n` +

            `### Base Stats\n` +

            `HP: ${pokemon.baseStats.hp}\n` +
            `Atk: ${pokemon.baseStats.atk}\n` +
            `Def: ${pokemon.baseStats.def}\n` +
            `SpA: ${pokemon.baseStats.spa}\n` +
            `SpD: ${pokemon.baseStats.spd}\n` +
            `Spe: ${pokemon.baseStats.spe}`

          )

          .setThumbnail(
            `https://play.pokemonshowdown.com/sprites/ani/${pokemon.id}.gif`
          )

          .setFooter({

            text:
              `Requested by ${interaction.user.username}`,

            iconURL:
              interaction.user.displayAvatarURL()
          })

          .setTimestamp();

      return interaction.editReply({
        embeds: [embed]
      });
    }

    // =========================
    // MOVE
    // =========================

    const move =
      Dex.moves.get(query);

    if (move.exists) {

      const embed =
        new EmbedBuilder()

          .setTitle(
            `⚔️ ${move.name}`
          )

          .setColor(
            getRandomColor()
          )

          .setDescription(

            `### Move Information\n` +

            `**Type:** ${move.type}\n` +

            `**Category:** ${move.category}\n` +

            `**Power:** ${move.basePower || "—"}\n` +

            `**Accuracy:** ${move.accuracy || "—"}\n` +

            `**PP:** ${move.pp}\n\n` +

            `### Description\n` +

            `${move.shortDesc || "No description."}`
          )

          .setFooter({

            text:
              `Requested by ${interaction.user.username}`,

            iconURL:
              interaction.user.displayAvatarURL()
          })

          .setTimestamp();

      return interaction.editReply({
        embeds: [embed]
      });
    }

    // =========================
    // ITEM
    // =========================

    const item =
      Dex.items.get(query);

    if (item.exists) {

      const embed =
        new EmbedBuilder()

          .setTitle(
            `🎒 ${item.name}`
          )

          .setColor(
            getRandomColor()
          )

          .setDescription(

            `### Item Description\n` +

            `${item.desc || "No description."}`
          )

          .setThumbnail(
            `https://play.pokemonshowdown.com/sprites/itemicons/${item.id}.png`
          )

          .setFooter({

            text:
              `Requested by ${interaction.user.username}`,

            iconURL:
              interaction.user.displayAvatarURL()
          })

          .setTimestamp();

      return interaction.editReply({
        embeds: [embed]
      });
    }

    // =========================
    // ABILITY
    // =========================

    const ability =
      Dex.abilities.get(query);

    if (ability.exists) {

      const embed =
        new EmbedBuilder()

          .setTitle(
            `✨ ${ability.name}`
          )

          .setColor(
            getRandomColor()
          )

          .setDescription(

            `### Ability Description\n` +

            `${ability.desc || "No description."}`
          )

          .setFooter({

            text:
              `Requested by ${interaction.user.username}`,

            iconURL:
              interaction.user.displayAvatarURL()
          })

          .setTimestamp();

      return interaction.editReply({
        embeds: [embed]
      });
    }

    return interaction.editReply({

      content:
        "❌ No data found."
    });
  }
};
