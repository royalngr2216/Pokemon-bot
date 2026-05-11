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

      const lines =
        text
          .split("\n")
          .map(line => line.trim())
          .filter(Boolean);

      // =========================
      // USERNAME CHECK
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

      // =========================
      // DEADLINE
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
      // FIND MATCHUPS
      // =========================

      let currentSet =
        "Main";

      let imported = 0;

      for (const line of lines) {

        // =========================
        // TRACK SETS
        // =========================

        if (
          /^SET\s+\d+/i.test(
            line
          )
        ) {

          currentSet =
            line;

          continue;
        }

        // =========================
        // MUST CONTAIN VS
        // =========================

        if (
          !/vs/i.test(line)
        ) continue;

        const parts =
          line.split(/vs/i);

        if (
          parts.length !== 2
        ) continue;

        const left =
          parts[0].trim();

        const right =
          parts[1].trim();

        // =========================
        // IGNORE TEAM VS TEAM
        // =========================

        if (
          left === left.toUpperCase() ||
          right === right.toUpperCase()
        ) {

          continue;
        }

        const usernameLower =
          user.smogonName
            .toLowerCase();

        let opponent =
          null;

        if (
          left.toLowerCase() ===
          usernameLower
        ) {

          opponent = right;
        }

        else if (
          right.toLowerCase() ===
          usernameLower
        ) {

          opponent = left;
        }

        if (!opponent)
          continue;

        // =========================
        // DUPLICATE CHECK
        // =========================

        const exists =
          await Tour.findOne({

            discordId:
              interaction.user.id,

            tournament:
              title,

            opponent,

            set:
              currentSet
          });

        if (exists)
          continue;

        // =========================
        // SAVE MATCH
        // =========================

        await Tour.create({

          discordId:
            interaction.user.id,

          tournament:
            title,

          set:
            currentSet,

          round:
            currentSet,

          opponent,

          deadline,

          thread:
            url,

          scheduled:
            false
        });

        imported++;
      }

      // =========================
      // NOTHING FOUND
      // =========================

      if (!imported) {

        return interaction.editReply({

          content:
            "❌ No matchups found for your username."
        });
      }

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

          .setDescription(

            `✅ Imported **${imported}** matches.\n\n` +

            `🏆 **Tournament**\n` +
            `${title}\n\n` +

            `⏰ **Deadline**\n` +
            `${deadline}`
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
