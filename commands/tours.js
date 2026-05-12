const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const Tour =
  require("../models/Tour");

const {
  getRandomColor
} = require("../utils/colors");

module.exports = {

  data: new SlashCommandBuilder()

    .setName("tours")

    .setDescription(
      "View tournament matches"
    )

    .addUserOption(option =>

      option

        .setName("user")

        .setDescription(
          "User to view matches for"
        )

        .setRequired(false)
    ),

  async execute(interaction) {

    await interaction.deferReply();

    // =========================
    // TARGET USER
    // =========================

    const targetUser =

      interaction.options.getUser(
        "user"
      )

      ||

      interaction.user;

    // =========================
    // GET TOURS
    // =========================

    const tours =
      await Tour.find({

        discordId:
          targetUser.id
      });

    if (!tours.length) {

      return interaction.editReply({

        content:
          `❌ ${targetUser.username} has no active tournaments.`
      });
    }

    let currentPage = 0;

    // =========================
    // EMBED
    // =========================

    const generateEmbed = index => {

      const tour =
        tours[index];

      const safeSet =

        typeof tour.set === "string"

        ? tour.set

        : "Main";

      const embed =
        new EmbedBuilder()

          .setColor(
            getRandomColor()
          )

          .setAuthor({

            name:
              `${targetUser.username}'s Tournament Tracker`,

            iconURL:
              targetUser.displayAvatarURL()
          })

          .setTitle(
            `MATCH ${index + 1}`
          )

          .setThumbnail(
            "https://cdn.discordapp.com/embed/avatars/0.png"
          )

          .setDescription(

            `━━━━━━━━━━━━━━━━━━\n\n` +

            `🏆 **Tournament**\n` +
            `${tour.tournament || "Unknown Tournament"}\n\n` +

            `📦 **Set**\n` +
            `${safeSet}\n\n` +

            `⚔ **Opponent**\n` +
            `**${tour.opponent || "Unknown"}**\n\n` +

            (

              tour.scheduled &&
              tour.scheduledFor

              ?

              `✅ **Scheduled Time**\n` +

              `🕒 <t:${Math.floor(
                tour.scheduledFor / 1000
              )}:F>\n\n` +

              `⏳ <t:${Math.floor(
                tour.scheduledFor / 1000
              )}:R>\n\n`

              :

              `❌ **Status**\n` +
              `Unscheduled\n\n`
            ) +

            `⏰ **Deadline**\n` +
            `${tour.deadline || "No deadline"}\n\n` +

            `━━━━━━━━━━━━━━━━━━`
          )

          .setFooter({

            text:
              `ORAS Utilities • Match ${index + 1}/${tours.length}`
          })

          .setTimestamp();

      return embed;
    };

    // =========================
    // BUTTONS
    // =========================

    const row =
      new ActionRowBuilder()

        .addComponents(

          new ButtonBuilder()

            .setCustomId(
              "previous"
            )

            .setEmoji(
              "⬅️"
            )

            .setStyle(
              ButtonStyle.Primary
            ),

          new ButtonBuilder()

            .setCustomId(
              "next"
            )

            .setEmoji(
              "➡️"
            )

            .setStyle(
              ButtonStyle.Primary
            )
        );

    const message =
      await interaction.editReply({

        embeds: [
          generateEmbed(currentPage)
        ],

        components: [row]
      });

    // =========================
    // COLLECTOR
    // =========================

    const collector =
      message.createMessageComponentCollector({

        time:
          1000 * 60 * 60 * 24
      });

    collector.on(
      "collect",

      async i => {

        if (
          i.customId ===
          "previous"
        ) {

          currentPage--;

          if (
            currentPage < 0
          ) {

            currentPage =
              tours.length - 1;
          }
        }

        else if (
          i.customId ===
          "next"
        ) {

          currentPage++;

          if (
            currentPage >=
            tours.length
          ) {

            currentPage = 0;
          }
        }

        await i.update({

          embeds: [
            generateEmbed(currentPage)
          ],

          components: [row]
        });
      }
    );
  }
};
