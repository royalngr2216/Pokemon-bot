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
  interaction.fields
    .getTextInputValue(
      "timezone"
    )
    .trim();

// =========================
// NORMALIZE GMT
// =========================

// +7 -> +07:00
// -4 -> -04:00

if (
  /^([+-])(\d{1,2})$/.test(
    timezone
  )
) {

  timezone =
    timezone.replace(

      /^([+-])(\d{1,2})$/,

      (_, sign, hour) =>

        `${sign}${hour.padStart(2, "0")}:00`
    );
}

// +7:00 -> +07:00
// -4:30 -> -04:30

else if (
  /^([+-])(\d{1,2}):(\d{2})$/.test(
    timezone
  )
) {

  timezone =
    timezone.replace(

      /^([+-])(\d{1,2}):(\d{2})$/,

      (_, sign, hour, minute) =>

        `${sign}${hour.padStart(2, "0")}:${minute}`
    );
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

const scheduledDate =
  moment()

    .utcOffset(
      timezone
    )

    .add(
      Number(days),
      "days"
    )

    .set({

      hour:
        Number(hours),

      minute:
        Number(minutes),

      second: 0,

      millisecond: 0
    });

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
