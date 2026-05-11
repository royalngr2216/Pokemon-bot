const Tour =
  require("../models/Tour");

const moment =
  require("moment-timezone");

module.exports = client => {

  setInterval(async () => {

    const tours =
      await Tour.find({

        scheduled: true
      });

    for (const tour of tours) {

      if (
        !tour.scheduleTime ||
        !tour.timezone
      ) continue;

      // =========================
      // BUILD DATE
      // =========================

      const now =
        moment.utc();

      const today =
        now.format(
          "YYYY-MM-DD"
        );

      const matchTime =
        moment.tz(

          `${today} ${tour.scheduleTime}`,

          "YYYY-MM-DD HH:mm",

          "UTC"
        )

        .utcOffset(
          tour.timezone
        );

      // =========================
      // 15 MINUTES BEFORE
      // =========================

      const diff =
        matchTime.diff(
          now,
          "minutes"
        );

      if (
        diff <= 15 &&
        diff >= 14 &&
        !tour.reminded
      ) {

        try {

          const user =
            await client.users.fetch(
              tour.discordId
            );

          await user.send(

            `⏰ Your match vs **${tour.opponent}** starts in 15 minutes.\n\n` +

            `🕒 ${tour.scheduleTime} GMT${tour.timezone}`
          );

          tour.reminded =
            true;

          await tour.save();

        } catch {}
      }
    }

  }, 60000);
};
