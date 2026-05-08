const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

const Match =
  require("../models/Match");

module.exports = {

  data: new SlashCommandBuilder()

    .setName("schedulecancel")

    .setDescription(
      "Cancel one of your scheduled matches"
    ),

  async execute(interaction) {

    const matches =
      await Match.find({

        guildId:
          interaction.guild.id,

        $or: [

          {
            player1:
              interaction.user.id
          },

          {
            player2:
              interaction.user.id
          }

        ],

        timestamp: {
          $gte:
            Math.floor(Date.now() / 1000)
        }

      }).sort({

        timestamp: 1
      });

    if (!matches.length) {

      return interaction.reply({

        content:
          "❌ You have no scheduled matches.",

        ephemeral: true
      });
    }

    let description = "";

    for (
      let i = 0;
      i < matches.length;
      i++
    ) {

      const match =
        matches[i];

      description +=

        `**${i + 1}.** ` +

        `<@${match.player1}> vs <@${match.player2}>\n` +

        `<t:${match.timestamp}:R>\n\n`;
    }

    const embed =
      new EmbedBuilder()

        .setColor(0x1E1F22)

        .setTitle(
          "Cancel Match"
        )

        .setDescription(

          description +

          "Reply with the match number to cancel."

        );

    await interaction.reply({

      embeds: [embed],

      ephemeral: true
    });

    const filter = m =>

      m.author.id ===
      interaction.user.id;

    const collector =
      interaction.channel.createMessageCollector({

        filter,

        time: 30000,

        max: 1
      });

    collector.on(
      "collect",

      async msg => {

        const number =
          parseInt(msg.content);

        if (
          isNaN(number) ||
          number < 1 ||
          number > matches.length
        ) {

          return interaction.followUp({

            content:
              "❌ Invalid match number.",

            ephemeral: true
          });
        }

        const match =
          matches[number - 1];

        await Match.deleteOne({
          _id: match._id
        });

        const confirm =
          new EmbedBuilder()

            .setColor(
              0xED4245
            )

            .setTitle(
              "Match Cancelled"
            )

            .setDescription(

              `<@${match.player1}> vs <@${match.player2}>\n\n` +

              `<t:${match.timestamp}:F>`

            );

        await interaction.followUp({

          embeds: [confirm],

          ephemeral: true
        });

        try {
          await msg.delete();
        } catch {}
      }
    );
  }
};