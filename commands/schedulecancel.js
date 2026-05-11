const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

const Tour =
  require("../models/Tour");

module.exports = {

  data: new SlashCommandBuilder()

    .setName("tourcancel")

    .setDescription(
      "Remove a tour"
    )

    .addStringOption(option =>

      option

        .setName("opponent")

        .setDescription(
          "Opponent name"
        )

        .setRequired(true)
    ),

  async execute(interaction) {

    await interaction.deferReply({

      ephemeral: true
    });

    const opponent =
      interaction.options
        .getString("opponent");

    const deleted =
      await Tour.findOneAndDelete({

        discordId:
          interaction.user.id,

        opponent: {

          $regex:
            new RegExp(
              `^${opponent}$`,
              "i"
            )
        }
      });

    if (!deleted) {

      return interaction.editReply({

        content:
          "❌ Opponent not found."
      });
    }

    const embed =
      new EmbedBuilder()

        .setTitle(
          "🗑 Tour Removed"
        )

        .setColor(
          0xED4245
        )

        .setDescription(

          `Removed match vs **${deleted.opponent}**`

        )

        .setTimestamp();

    await interaction.editReply({
      embeds: [embed]
    });
  }
};
