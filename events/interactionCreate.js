const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const moment =
  require("moment-timezone");

const Tour =
  require("../models/Tour");

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
// TOUR SCHEDULE MODAL
// ==================================================

if (
  interaction.customId.startsWith(
    "schedule_"
  )
) {

  const Tour =
    require("../models/Tour");

  const tourId =
    interaction.customId.replace(
      "schedule_",
      ""
    );

  const time =
  interaction.fields.getTextInputValue(
    "time"
  );

const days =
  interaction.fields.getTextInputValue(
    "days"
  );

  let timezone =
  interaction.fields.getTextInputValue(
    "timezone"
  ).trim();

// =========================
// FIX GMT FORMAT
// =========================

timezone =
  timezone.replace(
    /^([+-])(\d):/,
    "$10$2:"
  );

if (
  /^([+-])(\d{1,2})$/.test(
    timezone
  )
) {

  timezone += ":00";
}

  const tour =
    await Tour.findById(
      tourId
    );

  if (!tour) {

    return interaction.reply({

      content:
        "❌ Tour not found.",

      ephemeral: true
    });
  }

const [hours, minutes] =
  time.split(":");

// =========================
// CURRENT TIME IN USER TZ
// =========================

const now =
  moment()

    .utcOffset(
      timezone
    );

// =========================
// BUILD MATCH TIME
// =========================

const scheduledDate =
  moment()

    .utcOffset(
      timezone
    )

    .add(
      Number(days),
      "days"
    )

    .hour(
      Number(hours)
    )

    .minute(
      Number(minutes)
    )

    .second(0)

    .millisecond(0);

// =========================
// IF TIME ALREADY PASSED
// =========================

if (
  Number(days) === 0 &&
  scheduledDate.isBefore(now)
) {

  scheduledDate.add(
    1,
    "day"
  );
}

tour.scheduledFor =
  scheduledDate.valueOf();

tour.reminded =
  false;


  tour.scheduled =
    true;

  tour.scheduleTime =
    time;

  tour.timezone =
    timezone;

  await tour.save();

  return interaction.reply({

  content:

    `✅ Scheduled vs **${tour.opponent}**\n` +

    `🕒 ${time} GMT${timezone}`,

  ephemeral: true
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
        // HELP MENU
        // ==================================================

        if (
          interaction.customId.startsWith(
            "help_"
          )
        ) {

          const type =
            interaction.customId
              .split("_")[1];

          let embed =
            new EmbedBuilder();

          if (
            type ===
            "competitive"
          ) {

            embed

              .setTitle(
                "⚔ Competitive Commands"
              )

              .setColor(
                0x5865F2
              )

              .setDescription(

                "`/pokemon`\n" +

                "View Pokémon sets and competitive information."

              );
          }

          if (
            type ===
            "utilities"
          ) {

            embed

              .setTitle(
                "🌍 Utility Commands"
              )

              .setColor(
                0x57F287
              )

              .setDescription(

                "`/tz`\n" +

                "Create localized tournament times.\n\n" +

                "`/remind`\n" +

                "Set tournament reminders."

              );
          }

          if (
            type ===
            "tournament"
          ) {

            embed

              .setTitle(
                "🏆 Tournament Commands"
              )

              .setColor(
                0xED4245
              )

              .setDescription(

                "`/schedule`\n" +

                "Schedule tournament matches.\n\n" +

                "`/matches`\n" +

                "View upcoming scheduled matches."

              );
          }

          const row =
            new ActionRowBuilder()

              .addComponents(

                new ButtonBuilder()

                  .setCustomId(
                    "help_home"
                  )

                  .setLabel(
                    "Back"
                  )

                  .setStyle(
                    ButtonStyle.Secondary
                  )
              );

          if (
            type === "home"
          ) {

            embed

              .setTitle(
                "🌌 OrasBot Command Center"
              )

              .setDescription(

                "Competitive Pokémon tools,\n" +

                "tournament scheduling,\n" +

                "and utility systems.\n\n" +

                "Choose a category below."

              )

              .setColor(
                0x5865F2
              )

              .addFields(

                {

                  name:
                    "⚔ Competitive",

                  value:

                    "Pokémon sets,\n" +

                    "competitive resources.",

                  inline: true
                },

                {

                  name:
                    "🌍 Utilities",

                  value:

                    "Timezone conversion\n" +

                    "and reminders.",

                  inline: true
                },

                {

                  name:
                    "🏆 Tournament",

                  value:

                    "Scheduling,\n" +

                    "matches,\n" +

                    "and tracking.",

                  inline: true
                }
              );

            const homeRow =
              new ActionRowBuilder()

                .addComponents(

                  new ButtonBuilder()

                    .setCustomId(
                      "help_competitive"
                    )

                    .setLabel(
                      "Competitive"
                    )

                    .setEmoji("⚔")

                    .setStyle(
                      ButtonStyle.Primary
                    ),

                  new ButtonBuilder()

                    .setCustomId(
                      "help_utilities"
                    )

                    .setLabel(
                      "Utilities"
                    )

                    .setEmoji("🌍")

                    .setStyle(
                      ButtonStyle.Success
                    ),

                  new ButtonBuilder()

                    .setCustomId(
                      "help_tournament"
                    )

                    .setLabel(
                      "Tournament"
                    )

                    .setEmoji("🏆")

                    .setStyle(
                      ButtonStyle.Danger
                    )
                );

            return interaction.update({

              embeds: [embed],

              components: [homeRow]
            });
          }

          return interaction.update({

            embeds: [embed],

            components: [row]
          });
        }
        // ==================================================
        // POKEMON BUTTONS
        // ==================================================

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
  // OWNER ID
  // =========================

  const OWNER_ID =
    "1287545546231255092";

  // =========================
  // BLOCK DMS
  // =========================

  if (
    !interaction.guild &&
    interaction.user.id !== OWNER_ID
  ) {

    if (
  interaction.deferred ||
  interaction.replied
) {

  return interaction.editReply({

    content:
      "❌ You cannot use this command in DMs."
  });
}

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

  try {

    if (
      interaction.deferred ||
      interaction.replied
    ) {

      await interaction.editReply({
        content:
          "❌ Command error."
      });

    } else {

      await interaction.reply({
        content:
          "❌ Command error.",
          ephemeral: true
      });
    }

  } catch {}
}
}
    }
  );
};
