const {
  SlashCommandBuilder,
  EmbedBuilder
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
      "View your active Smogon tours"
    ),

  async execute(interaction) {

    await interaction.deferReply();

    const tours =
      await Tour.find({

        discordId:
          interaction.user.id
      });

    if (!tours.length) {

      return interaction.editReply({

        content:
          "❌ You have no active tours."
      });
    }

    const embeds = [];

    for (const [index, tour] of tours.entries()) {

      const scheduled =
        tour.scheduled;

      const embed =
        new EmbedBuilder()

          .setColor(
            getRandomColor()
          )

          .setAuthor({

            name:
              `${interaction.user.username}'s Tournament Tracker`,

            iconURL:
              interaction.user.displayAvatarURL()
          })

          .setTitle(

            `🎮 MATCH ${index + 1}`
          )

          .setDescription(

            `━━━━━━━━━━━━━━━━━━\n\n` +

`🏆 **Tournament**\n` +
`${tour.tournament}\n\n` +

`📦 **Set**\n` +
`${tour.set || "Main"}\n\n` +

`⚔ **Opponent**\n` +
`**${tour.opponent}**\n\n` +

(

              scheduled

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
            `${tour.deadline}\n\n` +

            `━━━━━━━━━━━━━━━━━━`
          )

          .setThumbnail(
            interaction.user.displayAvatarURL()
          )

          .setFooter({

            text:
              `ORAS Utilities • Match ${index + 1}/${tours.length}`
          })

          .setTimestamp();

      embeds.push(embed);
    }

    await interaction.editReply({
      embeds
    });
  }
};
