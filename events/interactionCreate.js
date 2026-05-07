const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require("discord.js");

const moment = require("moment-timezone");

const timezones =
  require("../utils/timezones");

module.exports = client => {

  client.on(
    "interactionCreate",
    async interaction => {

      // =========================
      // MODAL SUBMIT
      // =========================

      if (interaction.isModalSubmit()) {

        if (
          interaction.customId ===
          "tz_modal"
        ) {

          const time =
            interaction.fields.getTextInputValue(
              "tz_time"
            );

          const date =
            interaction.fields.getTextInputValue(
              "tz_date"
            );

          const menu =
            new StringSelectMenuBuilder()
              .setCustomId(
                `tz_select|${time}|${date}`
              )
              .setPlaceholder(
                "Select timezone"
              )
              .addOptions(timezones);

          const row =
            new ActionRowBuilder()
              .addComponents(menu);

          return interaction.reply({
            content:
              "Select your timezone:",
            components: [row],
            ephemeral: true
          });
        }
      }

      // =========================
      // TIMEZONE DROPDOWN
      // =========================

      if (
        interaction.isStringSelectMenu()
      ) {

        if (
          interaction.customId.startsWith(
            "tz_select"
          )
        ) {

          const parts =
            interaction.customId.split("|");

          const time = parts[1];

          const date = parts[2];

          const timezone =
            interaction.values[0];

          // PARSE TIME
          const parsed =
            moment.tz(
              `${date} ${time}`,
              "YYYY-MM-DD h:mm A",
              timezone
            );

          if (!parsed.isValid()) {

            return interaction.reply({
              content:
                "❌ Invalid date or time.",
              ephemeral: true
            });
          }

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

      if (interaction.isAutocomplete()) {

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

      if (interaction.isButton()) {

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
