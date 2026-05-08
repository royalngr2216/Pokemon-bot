const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

module.exports = {

  data: new SlashCommandBuilder()

    .setName("help")

    .setDescription(
      "View bot commands"
    ),

  async execute(interaction) {

    const embed =
      new EmbedBuilder()

        .setTitle(
          "OrasBot"
        )

        .setDescription(

          "Competitive Pokémon\n" +

          "Tournament scheduling\n" +

          "Timezone utilities"

        )

        .setColor(
          0x5865F2
        )

        .addFields(

          {

            name:
              "⚔ Competitive",

            value:

              "Pokémon resources and sets",

            inline: true
          },

          {

            name:
              "🌍 Utilities",

            value:

              "Timezone conversion and reminders",

            inline: true
          },

          {

            name:
              "🏆 Tournament",

            value:

              "Scheduling and match tracking",

            inline: true
          }
        );

    const row =
      new ActionRowBuilder()

        .addComponents(

          new ButtonBuilder()

            .setCustomId(
              "help_competitive"
            )

            .setLabel(
              "Competitive"
            )

            .setEmoji("⚔")

            .setStyle(
              ButtonStyle.Primary
            ),

          new ButtonBuilder()

            .setCustomId(
              "help_utilities"
            )

            .setLabel(
              "Utilities"
            )

            .setEmoji("🌍")

            .setStyle(
              ButtonStyle.Success
            ),

          new ButtonBuilder()

            .setCustomId(
              "help_tournament"
            )

            .setLabel(
              "Tournament"
            )

            .setEmoji("🏆")

            .setStyle(
              ButtonStyle.Danger
            )
        );

    await interaction.reply({

      embeds: [embed],

      components: [row]
    });
  }
};
