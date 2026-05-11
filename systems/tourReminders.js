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
        // 15 MINUTES
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

            await user.send(

              `⏰ Your match vs **${tour.opponent}** starts in 15 minutes!\n\n` +

              `🕒 <t:${Math.floor(
                tour.scheduledFor / 1000
              )}:F>\n\n` +

              `⏳ <t:${Math.floor(
                tour.scheduledFor / 1000
              )}:R>`
            );

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
