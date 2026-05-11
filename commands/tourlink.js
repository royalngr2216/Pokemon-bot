const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

const axios =
  require("axios");

const cheerio =
  require("cheerio");

const User =
  require("../models/User");

const Tour =
  require("../models/Tour");

module.exports = {

  data: new SlashCommandBuilder()

    .setName("tourlink")

    .setDescription(
      "Import a Smogon tournament thread"
    )

    .addStringOption(option =>

      option

        .setName("url")

        .setDescription(
          "Smogon thread URL"
        )

        .setRequired(true)
    ),

  async execute(interaction) {

    await interaction.deferReply();

    // =========================
    // GET USER
    // =========================

    const user =
      await User.findOne({

        discordId:
          interaction.user.id
      });

    if (!user) {

      return interaction.editReply({

        content:
          "❌ Register first using `/register`"
      });
    }

    const url =
      interaction.options
        .getString("url");

    try {

      // =========================
      // FETCH PAGE
      // =========================

      const response =
        await axios.get(url);

      const html =
        response.data;

      const $ =
        cheerio.load(html);

      const text =
        $("body").text();

      // =========================
      // FIND USERNAME
      // =========================

      if (
        !text.toLowerCase().includes(
          user.smogonName.toLowerCase()
        )
      ) {

        return interaction.editReply({

          content:
            "❌ Your Smogon username was not found in this thread."
        });
      }

      // =========================
      // FIND OPPONENT
      // =========================

      let opponent =
        "Unknown";

      const regex1 =
        new RegExp(

          `${user.smogonName}\\s+vs\\.?\\s+([A-Za-z0-9_-]+)`,

          "i"
        );

      const regex2 =
        new RegExp(

          `([A-Za-z0-9_-]+)\\s+vs\\.?\\s+${user.smogonName}`,

          "i"
        );

      const match1 =
        text.match(regex1);

      const match2 =
        text.match(regex2);

      if (match1) {

        opponent =
          match1[1];

      } else if (match2) {

        opponent =
          match2[1];
      }

      // =========================
      // FIND DEADLINE
      // =========================

      let deadline =
        "Unknown";

      const deadlineRegex =

        /deadline[^a-zA-Z0-9]*([^\n]+)/i;

      const deadlineMatch =
        text.match(deadlineRegex);

      if (deadlineMatch) {

        deadline =
          deadlineMatch[1]
            .trim()
            .slice(0, 100);
      }

      // =========================
      // CLEAN TITLE
      // =========================

      let title =
        $("title")
          .text()
          .replace(
            " | Smogon Forums",
            ""
          )
          .trim();

      title =
        title
          .replace(
            /Thread starterStart date/i,
            ""
          )
          .trim();

      // =========================
      // DUPLICATE CHECK
      // =========================

      const existing =
        await Tour.findOne({

          discordId:
            interaction.user.id,

          thread: url
        });

      if (existing) {

        return interaction.editReply({

          content:
            "⚠ This thread is already imported."
        });
      }

      // =========================
      // SAVE TOUR
      // =========================

      await Tour.create({

        discordId:
          interaction.user.id,

        tournament:
          title,

        round:
          title,

        opponent,

        deadline,

        thread: url
      });

      // =========================
      // EMBED
      // =========================

      const embed =
        new EmbedBuilder()

          .setTitle(
            "🏆 Tour Imported"
          )

          .setColor(
            0x5865F2
          )

          .addFields(

            {

              name:
                "Tournament",

              value:
                title
            },

            {

              name:
                "Opponent",

              value:
                opponent
            },

            {

              name:
                "Deadline",

              value:
                deadline
            }
          )

          .setFooter({

            text:
              "Use /tours to view all active tours"
          })

          .setTimestamp();

      await interaction.editReply({
        embeds: [embed]
      });

    } catch (err) {

      console.error(err);

      await interaction.editReply({

        content:
          "❌ Failed to parse thread."
      });
    }
  }
};
