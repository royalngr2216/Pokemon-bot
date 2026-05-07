const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

const moment =
  require("moment-timezone");

module.exports = {

  data: new SlashCommandBuilder()

    .setName("tz")

    .setDescription(
      "Create a localized match time"
    )

    // TIME
    .addStringOption(option =>

      option

        .setName("time")

        .setDescription(
          "24h format (example: 21:30)"
        )

        .setRequired(true)
    )

    // DAYS
    .addIntegerOption(option =>

      option

        .setName("days")

        .setDescription(
          "0 = today, 1 = tomorrow"
        )

        .setRequired(true)
    )

    // TIMEZONE
    .addStringOption(option =>

      option

        .setName("timezone")

        .setDescription(
          "Search timezone"
        )

        .setRequired(true)

        .setAutocomplete(true)
    ),

  // =========================
  // AUTOCOMPLETE
  // =========================

  async autocomplete(interaction) {

    const focused =
      interaction.options
        .getFocused()
        .toLowerCase();

    const allTimezones =
      moment.tz.names();

    const filtered =
      allTimezones

        .filter(tz =>

          tz.toLowerCase()
            .includes(focused)
        )

        .slice(0, 25);

    await interaction.respond(

      filtered.map(tz => ({

        name: tz,

        value: tz

      }))
    );
  },

  // =========================
  // EXECUTE
  // =========================

  async execute(interaction) {

    const time =
      interaction.options.getString(
        "time"
      );

    const days =
      interaction.options.getInteger(
        "days"
      );

    const timezone =
      interaction.options.getString(
        "timezone"
      );

    // VALIDATE TIME
    const timeRegex =
      /^([01]?\d|2[0-3]):([0-5]\d)$/;

    if (
      !timeRegex.test(time)
    ) {

      return interaction.reply({

        content:
          "❌ Invalid time format. Use `21:30`",

        ephemeral: true
      });
    }

    if (
      days < 0
    ) {

      return interaction.reply({

        content:
          "❌ Days cannot be negative.",

        ephemeral: true
      });
    }

    if (
      !moment.tz.zone(timezone)
    ) {

      return interaction.reply({

        content:
          "❌ Invalid timezone.",

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
};
