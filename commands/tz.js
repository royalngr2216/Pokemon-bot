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
      "Create a localized tournament time"
    ),

  async execute(interaction) {

    const modal = new ModalBuilder()
      .setCustomId("tz_modal")
      .setTitle("Match Time");

    // TIME INPUT
    const timeInput =
      new TextInputBuilder()
        .setCustomId("tz_time")
        .setLabel(
          "Enter time (Example: 7:30 PM)"
        )
        .setStyle(
          TextInputStyle.Short
        )
        .setRequired(true);

    // DATE INPUT
    const dateInput =
      new TextInputBuilder()
        .setCustomId("tz_date")
        .setLabel(
          "Enter date (YYYY-MM-DD)"
        )
        .setStyle(
          TextInputStyle.Short
        )
        .setPlaceholder(
          "2026-05-08"
        )
        .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder()
        .addComponents(timeInput),

      new ActionRowBuilder()
        .addComponents(dateInput)
    );

    await interaction.showModal(modal);
  }
};
