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

          const tzRegex =
            /^[+-]?\d{2}:\d{2}$/;

          if (
            !tzRegex.test(timezone)
          ) {

            return interaction.reply({

              content:
                "❌ Invalid GMT offset.",

              ephemeral: true
            });
          }

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

              )

              .setTimestamp();

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

          // =====================
          // NORMALIZE GMT
          // =====================

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
          // MATCH ID
          // =====================

          const matchId =
            `SCH-${Math.floor(
              Math.random() * 999999
            )}`;

          // =====================
          // SAVE DATABASE
          // =====================

          await Match.create({

            matchId,

            guildId:
              interaction.guild.id,

            player1:
              interaction.user.id,

            player2:
              opponent.id,

            timestamp: unix,

            notes,

            status: "pending"

          });

          // =====================
          // BUTTONS
          // =====================

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

          // =====================
          // EMBED
          // =====================

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

              )

              .setFooter({
                text: matchId
              })

              .setTimestamp();

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

        // ==================================================
        // ACCEPT
        // ==================================================

        if (
          interaction.customId.startsWith(
            "accept_"
          )
        ) {

          const matchId =
            interaction.customId
              .split("_")[1];

          const match =
            await Match.findOne({
              matchId
            });

          if (!match) {

            return interaction.reply({

              content:
                "❌ Match not found.",

              ephemeral: true
            });
          }

          if (
            interaction.user.id !==
            match.player2
          ) {

            return interaction.reply({

              content:
                "❌ Only the opponent can accept.",

              ephemeral: true
            });
          }

          match.status =
            "confirmed";

          await match.save();

          const embed =
            EmbedBuilder.from(
              interaction.message
                .embeds[0]
            )

              .setColor(
                0x57F287
              )

              .spliceFields(0, 0)

              .setDescription(

                interaction.message
                  .embeds[0]
                  .description

                  .replace(
                    "🟡 Awaiting confirmation",
                    "🟢 Confirmed"
                  )
              );

          return interaction.update({

            embeds: [embed],

            components: []
          });
        }

        // ==================================================
        // DECLINE
        // ==================================================

        if (
          interaction.customId.startsWith(
            "decline_"
          )
        ) {

          const matchId =
            interaction.customId
              .split("_")[1];

          const match =
            await Match.findOne({
              matchId
            });

          if (!match) {

            return interaction.reply({

              content:
                "❌ Match not found.",

              ephemeral: true
            });
          }

          if (
            interaction.user.id !==
            match.player2
          ) {

            return interaction.reply({

              content:
                "❌ Only the opponent can decline.",

              ephemeral: true
            });
          }

          match.status =
            "declined";

          await match.save();

          const embed =
            EmbedBuilder.from(
              interaction.message
                .embeds[0]
            )

              .setColor(
                0xED4245
              )

              .setDescription(

                interaction.message
                  .embeds[0]
                  .description

                  .replace(
                    "🟡 Awaiting confirmation",
                    "🔴 Declined"
                  )
              );

          return interaction.update({

            embeds: [embed],

            components: []
          });
        }

        // ==================================================
        // POKEMON BUTTONS
        // ==================================================

        const pokemonCommand =
          client.commands.get(
            "pokemon"
          );

        if (!pokemonCommand)
          return;

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
    }
  );
};
