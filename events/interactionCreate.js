const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require("discord.js");

const moment =
  require("moment-timezone");

const timezones =
  require("../utils/timezones");

module.exports = client => {

  client.on(
    "interactionCreate",
    async interaction => {

      // =========================
      // TIMEZONE SELECT
      // =========================

      if (
        interaction.isStringSelectMenu()
      ) {

        // =====================
        // TZ DROPDOWN
        // =====================

        if (
          interaction.customId ===
          "tz_timezone_select"
        ) {

          const timezone =
            interaction.values[0];

          const modal =
            new ModalBuilder()

              .setCustomId(
                `tz_modal|${timezone}`
              )

              .setTitle(
                "Match Time"
              );

          // TIME INPUT
          const timeInput =
            new TextInputBuilder()

              .setCustomId(
                "tz_time"
              )

              .setLabel(
                "Time (24h format)"
              )

              .setPlaceholder(
                "21:30"
              )

              .setStyle(
                TextInputStyle.Short
              )

              .setRequired(true);

          // DAYS INPUT
          const daysInput =
            new TextInputBuilder()

              .setCustomId(
                "tz_days"
              )

              .setLabel(
                "Days from now"
              )

              .setPlaceholder(
                "0 = today, 1 = tomorrow"
              )

              .setStyle(
                TextInputStyle.Short
              )

              .setRequired(true);

          modal.addComponents(

            new ActionRowBuilder()
              .addComponents(timeInput),

            new ActionRowBuilder()
              .addComponents(daysInput)

          );

          return interaction.showModal(
            modal
          );
        }
      }

      // =========================
      // MODAL SUBMIT
      // =========================

      if (
        interaction.isModalSubmit()
      ) {

        if (
          interaction.customId.startsWith(
            "tz_modal"
          )
        ) {

          const timezone =
            interaction.customId
              .split("|")[1];

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

          // VALIDATE TIME
          const timeRegex =
            /^([01]?\d|2[0-3]):([0-5]\d)$/;

          if (
            !timeRegex.test(time)
          ) {

            return interaction.reply({

              content:
                "❌ Invalid time format. Use 24h format like `21:30`",

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

          const [hours, minutes] =
            time.split(":");

          // CREATE TIME
          const parsed =
            moment()

              .tz(timezone)

              .add(days, "days")

              .hour(parseInt(hours))

              .minute(parseInt(minutes))

              .second(0);

          const unix =
            Math.floor(
              parsed.valueOf() / 1000
            );

          const embed =
            new EmbedBuilder()

              .setTitle(
                "Match Time"
              )

              .setColor(0x5865F2)

              .setDescription(

                `**Scheduled by:** ${interaction.user}\n\n` +

                `### Local Time\n` +

                `<t:${unix}:F>\n\n` +

                `### Relative\n` +

                `<t:${unix}:R>\n\n` +

                `\`${time} • ${timezone}\``

              )

              .setTimestamp();

          await interaction.reply({
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
