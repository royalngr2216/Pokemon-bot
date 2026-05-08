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
          "Oras Utilities"
        )

        .setColor(
          0x5865F2
        )

        .addFields(

          {

            name:
              "⚔ Competitive",

            value:

              "`/pokemon`\n" +

              "Pokémon resources and sets",

            inline: false
          },

          {

            name:
              "🌍 Utilities",

            value:

              "`/tz`\n" +

              "Timezone conversion\n\n" +

              "`/remind`\n" +

              "Tournament reminders",

            inline: false
          },

          {

            name:
              "🏆 Tournament",

            value:

              "`/schedule`\n" +

              "Schedule matches\n\n" +

              "`/matches`\n" +

              "View scheduled matches",

            inline: false
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
