const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const Match =
  require("../models/Match");

module.exports = {

  data: new SlashCommandBuilder()

    .setName("matches")

    .setDescription(
      "View tournament matches"
    ),

  async execute(interaction) {

    const matches =
      await Match.find({

        guildId:
          interaction.guild.id

      });

    if (!matches.length) {

      return interaction.reply({

        content:
          "❌ No matches found.",

        ephemeral: true
      });
    }

    // =========================
    // SORT PRIORITY
    // =========================

    const statusPriority = {

      confirmed: 0,
      pending: 1,
      declined: 2

    };

    matches.sort((a, b) => {

      const statusCompare =

        statusPriority[a.status] -
        statusPriority[b.status];

      if (
        statusCompare !== 0
      ) {

        return statusCompare;
      }

      return (
        a.timestamp -
        b.timestamp
      );
    });

    const page = 0;

    const matchesPerPage = 5;

    const maxPage =
      Math.ceil(
        matches.length /
        matchesPerPage
      ) - 1;

    const current =
      matches.slice(
        page * matchesPerPage,
        (page + 1) *
        matchesPerPage
      );

    const embed =
      new EmbedBuilder()

        .setTitle(
          "Tournament Matches"
        )

        .setColor(
          0x5865F2
        );

    current.forEach(match => {

      let statusEmoji =
        "🟡";

      if (
        match.status ===
        "confirmed"
      ) {
        statusEmoji = "🟢";
      }

      if (
        match.status ===
        "declined"
      ) {
        statusEmoji = "🔴";
      }

      embed.addFields({

        name:
          `${statusEmoji} ${match.matchId}`,

        value:

          `<@${match.player1}> vs <@${match.player2}>\n\n` +

          `<t:${match.timestamp}:F>\n` +

          `<t:${match.timestamp}:R>`,

        inline: false
      });
    });

    embed.setFooter({

      text:
        `Page ${page + 1}/${maxPage + 1}`
    });

    const row =
      new ActionRowBuilder()

        .addComponents(

          new ButtonBuilder()

            .setCustomId(
              `matches_prev_${page}`
            )

            .setLabel(
              "Previous"
            )

            .setStyle(
              ButtonStyle.Secondary
            )

            .setDisabled(true),

          new ButtonBuilder()

            .setCustomId(
              `matches_next_${page}`
            )

            .setLabel(
              "Next"
            )

            .setStyle(
              ButtonStyle.Secondary
            )

            .setDisabled(
              page >= maxPage
            )
        );

    await interaction.reply({

      embeds: [embed],

      components: [row]
    });
  }
};
