const Match =
  require("../models/Match");

module.exports = client => {

  setInterval(async () => {

    try {

      const now =
        Math.floor(Date.now() / 1000);

      // =========================
      // FIND UPCOMING MATCHES
      // =========================

      const matches =
        await Match.find({

          status: "confirmed",

          reminded: false,

          timestamp: {

            $lte: now + 900,
            $gte: now

          }
        });

      for (const match of matches) {

        const channel =
          await client.channels
            .fetch(
              match.channelId
            )
            .catch(() => null);

        if (!channel)
          continue;

        await channel.send({

          content:

            `⏰ **Match Reminder**\n\n` +

            `<@${match.player1}> vs <@${match.player2}>\n\n` +

            `Your match starts in 15 minutes.\n\n` +

            `<t:${match.timestamp}:F>`

        });

        match.reminded = true;

        await match.save();
      }

      // =========================
      // CLEANUP OLD MATCHES
      // =========================

      await Match.deleteMany({

        timestamp: {

          $lt: now - 3600
        }

      });

    } catch (err) {

      console.error(
        "Reminder Error:",
        err
      );
    }

  }, 60000);

};
