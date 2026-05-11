const {
  EmbedBuilder
} = require("discord.js");

const Tour =
  require("../models/Tour");

module.exports = client => {

  setInterval(async () => {

    try {

      const tours =
        await Tour.find({

          scheduled: true,

          reminded: false,

          scheduledFor: {

            $ne: null
          }
        });

      const now =
        Date.now();

      for (const tour of tours) {

        const diff =
          tour.scheduledFor - now;

        // =========================
        // 15 MINUTES BEFORE
        // =========================

        if (

          diff <= 15 * 60 * 1000 &&
          diff > 14 * 60 * 1000

        ) {

          try {

            const user =
              await client.users.fetch(
                tour.discordId
              );

            const colors = [

              0x5865F2,
              0x57F287,
              0xFEE75C,
              0xEB459E,
              0xED4245,
              0x3498DB,
              0x9B59B6

            ];

            const randomColor =
              colors[
                Math.floor(
                  Math.random() *
                  colors.length
                )
              ];

            const embed =
              new EmbedBuilder()

                .setTitle(
                  "🏆 Tournament Reminder"
                )

                .setColor(
                  randomColor
                )

                .setDescription(

                  `You have to play against **${tour.opponent}** in 15 minutes.\n\n` +

                  `🕒 **Match Time**\n` +

                  `<t:${Math.floor(
                    tour.scheduledFor / 1000
                  )}:F>\n\n` +

                  `⏳ **Starts**\n` +

                  `<t:${Math.floor(
                    tour.scheduledFor / 1000
                  )}:R>`
                )

                .setFooter({

                  text:
                    "Good luck & have fun ⚔️"
                })

                .setTimestamp();

            await user.send({
              embeds: [embed]
            });

            tour.reminded =
              true;

            await tour.save();

          } catch (err) {

            console.log(
              err
            );
          }
        }

        // =========================
        // AUTO CLEANUP
        // =========================

        if (
          diff < -6 * 60 * 60 * 1000
        ) {

          await Tour.deleteOne({

            _id: tour._id
          });
        }
      }

    } catch (err) {

      console.log(err);
    }

  }, 60000);
};
