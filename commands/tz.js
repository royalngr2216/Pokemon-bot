const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder
} = require("discord.js");

module.exports = {

  data: new SlashCommandBuilder()

    .setName("tz")

    .setDescription(
      "Create a localized match time"
    ),

  async execute(interaction) {

    const modal =
      new ModalBuilder()

        .setCustomId(
          "tz_modal"
        )

        .setTitle(
          "Match Time"
        );

    // TIME
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

    // DAYS
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

    // TIMEZONE
    const timezoneInput =
      new TextInputBuilder()

        .setCustomId(
          "tz_timezone"
        )

        .setLabel(
          "GMT Offset"
        )

        .setPlaceholder(
          "+5:30, -08:00, 00:00"
        )

        .setStyle(
          TextInputStyle.Short
        )

        .setRequired(true);

    modal.addComponents(

      new ActionRowBuilder()
        .addComponents(timeInput),

      new ActionRowBuilder()
        .addComponents(daysInput),

      new ActionRowBuilder()
        .addComponents(timezoneInput)

    );

    await interaction.showModal(
      modal
    );
  }
};
