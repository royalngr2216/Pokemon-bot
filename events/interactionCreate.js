const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const moment =
  require("moment-timezone");

const Match =
  require("../models/Match");

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

        // ==================================================
        // TZ MODAL
        // ==================================================

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

          timezone =
            timezone.replace(/\s+/g, "");

          timezone =
            timezone.replace(
              /^([+-]?)(\d{1}):/,
              "$10$2:"
            );

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

              );

          return interaction.reply({
            embeds: [embed]
          });
        }

        // ==================================================
        // SCHEDULE MODAL
        // ==================================================

        if (
          interaction.customId.startsWith(
            "schedule_modal"
          )
        ) {

          const opponentId =
            interaction.customId
              .split("|")[1];

          const opponent =
            await client.users.fetch(
              opponentId
            );

          const time =
            interaction.fields.getTextInputValue(
              "schedule_time"
            );

          const days =
            parseInt(
              interaction.fields.getTextInputValue(
                "schedule_days"
              )
            );

          let timezone =
            interaction.fields
              .getTextInputValue(
                "schedule_timezone"
              )
              .trim();

          const notes =
            interaction.fields.getTextInputValue(
              "schedule_notes"
            ) || "No notes.";

          timezone =
            timezone.replace(/\s+/g, "");

          timezone =
            timezone.replace(
              /^([+-]?)(\d{1}):/,
              "$10$2:"
            );

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

          const matchId =
            `SCH-${Math.floor(
              Math.random() * 999999
            )}`;

          await Match.create({

            matchId,

            guildId:
              interaction.guild.id,

            channelId:
              interaction.channel.id,

            player1:
              interaction.user.id,

            player2:
              opponent.id,

            timestamp: unix,

            notes,

            status: "pending"

          });

          const buttons =
            new ActionRowBuilder()

              .addComponents(

                new ButtonBuilder()

                  .setCustomId(
                    `accept_${matchId}`
                  )

                  .setLabel(
                    "Accept"
                  )

                  .setStyle(
                    ButtonStyle.Success
                  ),

                new ButtonBuilder()

                  .setCustomId(
                    `decline_${matchId}`
                  )

                  .setLabel(
                    "Decline"
                  )

                  .setStyle(
                    ButtonStyle.Danger
                  )
              );

          const embed =
            new EmbedBuilder()

              .setTitle(
                "Match Scheduled"
              )

              .setColor(
                0xFEE75C
              )

              .setDescription(

                `### Players\n` +

                `${interaction.user} vs ${opponent}\n\n` +

                `### Match Time\n` +

                `<t:${unix}:F>\n\n` +

                `### Relative\n` +

                `<t:${unix}:R>\n\n` +

                `### Notes\n` +

                `${notes}\n\n` +

                `### Status\n` +

                `🟡 Awaiting confirmation`

              );

          return interaction.reply({

            content:
              `${opponent}`,

            embeds: [embed],

            components: [buttons]
          });
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

        if (pokemonCommand) {

          const pokemon =
            pokemonCommand.pokemon;

          const [action, name] =
            interaction.customId.split("_");

          const mon =
            pokemon?.[name];

          if (mon) {

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

            if (
              page >= images.length
            )
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

            return interaction.update({
              embeds: [embed]
            });
          }
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

        // =========================
        // BLOCK DMS
        // =========================

        if (!interaction.guild) {

          return interaction.reply({

            content:
              "❌ You cannot use this command in DMs.",

            ephemeral: true
          });
        }

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
    }
  );
};
