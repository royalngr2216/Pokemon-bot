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

      // =========================
      // CLEAN TEXT
      // =========================

      const text =
        $("body")

          .text()

          // weird unicode spaces
          .replace(/\u202F/g, " ")

          .replace(/\u00A0/g, " ")

          // normalize line endings
          .replace(/\r/g, "\n")

          // collapse spaces
          .replace(/[ \t]+/g, " ")

          // collapse many newlines
          .replace(/\n+/g, "\n")

          .trim();

      // =========================
      // FIND MATCHUP LINE
      // =========================

      const lines =
        text.split("\n");

      const username =
        user.smogonName
          .trim();

      let foundLine =
        null;

      for (const rawLine of lines) {

        const line =
          rawLine.trim();

        // must contain username
        if (
          !line
            .toLowerCase()
            .includes(
              username.toLowerCase()
            )
        ) continue;

        // must contain vs
        if (
          !line
            .toLowerCase()
            .includes("vs")
        ) continue;

        foundLine =
          line;

        break;
      }

      if (!foundLine) {

        return interaction.editReply({

          content:
            "❌ No matchups found for your username."
        });
      }

      // =========================
      // PARSE OPPONENT
      // =========================

      let opponent =
        "Unknown";

      const cleanedLine =
        foundLine

          .replace(/\s+vs\.?\s+/i, " vs ")

          .trim();

      const parts =
        cleanedLine.split(
          /\s+vs\s+/i
        );

      if (
        parts.length >= 2
      ) {

        const left =
          parts[0].trim();

        const right =
          parts[1].trim();

        if (
          left.toLowerCase() ===
          username.toLowerCase()
        ) {

          opponent = right;

        } else {

          opponent = left;
        }
      }

      // =========================
      // FIND SET
      // =========================

      let setName =
        "Main";

      for (
        let i = 0;
        i < lines.length;
        i++
      ) {

        const line =
          lines[i];

        if (
          line === foundLine
        ) {

          for (
            let j = i;
            j >= 0;
            j--
          ) {

            const upper =
              lines[j]
                .trim()
                .toUpperCase();

            if (
              upper.startsWith(
                "SET "
              )
            ) {

              setName =
                lines[j]
                  .trim();

              break;
            }
          }
        }
      }

      // =========================
      // FIND DEADLINE
      // =========================

      let deadline =
        "Unknown";

      const deadlineRegex =

        /deadline[^a-zA-Z0-9]*([^\n]+)/i;

      const deadlineMatch =
        text.match(
          deadlineRegex
        );

      if (deadlineMatch) {

        deadline =
          deadlineMatch[1]
            .trim()
            .slice(0, 150);
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

          thread: url,

          opponent
        });

      if (existing) {

        return interaction.editReply({

          content:
            "⚠ This matchup is already imported."
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

        set: setName,

        thread: url
      });

      // =========================
      // EMBED
      // =========================

      const embed =
        new EmbedBuilder()

          .setTitle(
            "🏆 Match Imported"
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
                "Set",

              value:
                setName
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
              "Use /tours to view active matches"
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