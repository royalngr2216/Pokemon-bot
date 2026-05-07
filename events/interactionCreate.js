const {
  EmbedBuilder
} = require("discord.js");

const moment =
  require("moment-timezone");

module.exports = client => {

  client.on(
    "interactionCreate",
    async interaction => {

      // =========================
      // MODAL SUBMIT
      // =========================

      if (
        interaction.isModalSubmit()
      ) {

        if (
          interaction.customId ===
          "tz_modal"
        ) {

          const time =
            interaction.fields.getTextInputValue(
              "tz_time"
            );

          const days =
            parseInt(
              interaction.fields.getTextInputValue(
                "tz_days"
              )
            );

          let timezone =
            interaction.fields
              .getTextInputValue(
                "tz_timezone"
              )
              .trim();

          // =====================
          // VALIDATE TIME
          // =====================

          const timeRegex =
            /^([01]?\d|2[0-3]):([0-5]\d)$/;

          if (
            !timeRegex.test(time)
          ) {

            return interaction.reply({

              content:
                "❌ Invalid time format.\nUse `21:30`",

              ephemeral: true
            });
          }

          // =====================
          // VALIDATE DAYS
          // =====================

          if (
            isNaN(days) ||
            days < 0
          ) {

            return interaction.reply({

              content:
                "❌ Invalid days value.",

              ephemeral: true
            });
          }

          // =====================
          // NORMALIZE GMT OFFSET
          // =====================

          timezone =
            timezone.replace(/\s+/g, "");

          // +7:30 -> +07:30
          // -7:45 -> -07:45

          timezone =
            timezone.replace(
              /^([+-]?)(\d{1}):/,
              "$10$2:"
            );

          // +0 -> +00:00
          // -0 -> -00:00
          // 0 -> 00:00

          if (
            timezone === "0"
          ) {
            timezone = "00:00";
          }

          if (
            timezone === "+0"
          ) {
            timezone = "+00:00";
          }

          if (
            timezone === "-0"
          ) {
            timezone = "-00:00";
          }

          // +7 -> +07:00
          // -8 -> -08:00

          timezone =
            timezone.replace(
              /^([+-]?)(\d{1,2})$/,
              "$1$2:00"
            );

          timezone =
            timezone.replace(
              /^([+-]?)(\d):/,
              "$10$2:"
            );

          // =====================
          // FINAL VALIDATION
          // =====================

          const tzRegex =
            /^[+-]?\d{2}:\d{2}$/;

          if (
            !tzRegex.test(timezone)
          ) {

            return interaction.reply({

              content:
                "❌ Invalid GMT offset.\n\nExamples:\n`+5:30`\n`-07:45`\n`00:00`\n`+10`\n`-8`",

              ephemeral: true
            });
          }

          // =====================
          // CHECK REAL-WORLD VALUES
          // =====================

          const validMinutes = [
            "00",
            "15",
            "30",
            "45"
          ];

          const split =
            timezone.split(":");

          const hourPart =
            parseInt(split[0]);

          const minutePart =
            split[1];

          if (
            hourPart < -12 ||
            hourPart > 14
          ) {

            return interaction.reply({

              content:
                "❌ GMT offset must be between -12 and +14.",

              ephemeral: true
            });
          }

          if (
            !validMinutes.includes(
              minutePart
            )
          ) {

            return interaction.reply({

              content:
                "❌ Minutes must be 00, 15, 30, or 45.",

              ephemeral: true
            });
          }

          // =====================
          // CREATE TIME
          // =====================

          const [hours, minutes] =
            time.split(":");

          const parsed =
            moment()

              .utcOffset(timezone)

              .add(days, "days")

              .hour(
                parseInt(hours)
              )

              .minute(
                parseInt(minutes)
              )

              .second(0);

          const unix =
            Math.floor(
              parsed.valueOf() / 1000
            );

          // =====================
          // RANDOM COLORS
          // =====================

          const colors = [

            0x5865F2,
            0x57F287,
            0xFEE75C,
            0xEB459E,
            0xED4245,
            0x3498DB,
            0x9B59B6,
            0x1ABC9C,
            0xE67E22,
            0x95A5A6

          ];

          const randomColor =
            colors[
              Math.floor(
                Math.random() *
                colors.length
              )
            ];

          // =====================
          // EMBED
          // =====================

          const embed =
            new EmbedBuilder()

              .setTitle(
                "Match Time"
              )

              .setColor(
                randomColor
              )

              .setDescription(

                `**Scheduled by:** ${interaction.user}\n\n` +

                `### Local Time\n` +

                `<t:${unix}:F>\n\n` +

                `### Relative\n` +

                `<t:${unix}:R>`

              )

              .setTimestamp();

          return interaction.reply({
            embeds: [embed]
          });
        }
      }

      // =========================
      // AUTOCOMPLETE
      // =========================

      if (
        interaction.isAutocomplete()
      ) {

        const command =
          client.commands.get(
            interaction.commandName
          );

        if (
          !command?.autocomplete
        ) return;

        return command.autocomplete(
          interaction
        );
      }

      // =========================
      // SLASH COMMANDS
      // =========================

      if (
        interaction.isChatInputCommand()
      ) {

        const command =
          client.commands.get(
            interaction.commandName
          );

        if (!command) return;

        try {

          await command.execute(
            interaction
          );

        } catch (err) {

          console.error(err);

          if (
            interaction.replied ||
            interaction.deferred
          ) {

            interaction.editReply({
              content:
                "❌ Command error."
            });

          } else {

            interaction.reply({
              content:
                "❌ Command error.",
              ephemeral: true
            });
          }
        }
      }

      // =========================
      // BUTTONS
      // =========================

      if (
        interaction.isButton()
      ) {

        const pokemonCommand =
          client.commands.get(
            "pokemon"
          );

        const pokemon =
          pokemonCommand.pokemon;

        const [action, name] =
          interaction.customId.split("_");

        const mon =
          pokemon[name];

        if (!mon) return;

        const images =
          mon.sets;

        let page =
          parseInt(
            interaction.message
              .embeds[0]
              .footer.text
              .split(" ")[1]
          ) - 1;

        if (action === "next")
          page++;

        if (action === "prev")
          page--;

        if (action === "first")
          page = 0;

        if (action === "last")
          page = images.length - 1;

        if (page < 0)
          page = images.length - 1;

        if (page >= images.length)
          page = 0;

        const oldEmbed =
          interaction.message
            .embeds[0];

        const embed =
          EmbedBuilder.from(
            oldEmbed
          )

          .setImage(
            images[page]
          )

          .setFooter({
            text:
              `Set ${page + 1} of ${images.length}`,

            iconURL:
              interaction.user.displayAvatarURL()
          });

        await interaction.update({
          embeds: [embed]
        });
      }
    }
  );
};
