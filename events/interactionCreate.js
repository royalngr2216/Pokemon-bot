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

        // ==================================================
        // MATCHES PAGINATION
        // ==================================================

        if (
          interaction.customId.startsWith(
            "matches_"
          )
        ) {

          const split =
            interaction.customId.split("_");

          const action =
            split[1];

          let page =
            parseInt(split[2]);

          const matches =
            await Match.find({

              guildId:
                interaction.guild.id,

              timestamp: {
                $gte:
                  Math.floor(Date.now() / 1000)
              }

            });

          const statusPriority = {

            confirmed: 0,
            pending: 1,
            declined: 2

          };

          matches.sort((a, b) => {

            const statusCompare =

              statusPriority[a.status] -
              statusPriority[b.status];

            if (
              statusCompare !== 0
            ) {

              return statusCompare;
            }

            return (
              a.timestamp -
              b.timestamp
            );
          });

          const matchesPerPage = 5;

          const maxPage =
            Math.ceil(
              matches.length /
              matchesPerPage
            ) - 1;

          if (
            action === "next"
          ) {
            page++;
          }

          if (
            action === "prev"
          ) {
            page--;
          }

          if (page < 0)
            page = 0;

          if (page > maxPage)
            page = maxPage;

          const current =
            matches.slice(

              page * matchesPerPage,

              (page + 1) *
              matchesPerPage
            );

          const embed =
            new EmbedBuilder()

              .setTitle(
                "Tournament Matches"
              )

              .setColor(
                0x5865F2
              );

          current.forEach(match => {

            let statusEmoji =
              "🟡";

            if (
              match.status ===
              "confirmed"
            ) {
              statusEmoji = "🟢";
            }

            if (
              match.status ===
              "declined"
            ) {
              statusEmoji = "🔴";
            }

            embed.addFields({

              name:
                `${statusEmoji} ${match.matchId}`,

              value:

                `<@${match.player1}> vs <@${match.player2}>\n\n` +

                `<t:${match.timestamp}:F>\n` +

                `<t:${match.timestamp}:R>`,

              inline: false
            });
          });

          embed.setFooter({

            text:
              `Page ${page + 1}/${maxPage + 1}`
          });

          const row =
            new ActionRowBuilder()

              .addComponents(

                new ButtonBuilder()

                  .setCustomId(
                    `matches_prev_${page}`
                  )

                  .setLabel(
                    "Previous"
                  )

                  .setStyle(
                    ButtonStyle.Secondary
                  )

                  .setDisabled(
                    page <= 0
                  ),

                new ButtonBuilder()

                  .setCustomId(
                    `matches_next_${page}`
                  )

                  .setLabel(
                    "Next"
                  )

                  .setStyle(
                    ButtonStyle.Secondary
                  )

                  .setDisabled(
                    page >= maxPage
                  )
              );

          return interaction.update({

            embeds: [embed],

            components: [row]
          });
        }

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
