const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder
} = require("discord.js");

module.exports = {

  data: new SlashCommandBuilder()

    .setName("schedule")

    .setDescription(
      "Schedule a tournament match"
    )

    .addUserOption(option =>

      option

        .setName("opponent")

        .setDescription(
          "Opponent"
        )

        .setRequired(true)
    ),

  async execute(interaction) {

    const opponent =
      interaction.options.getUser(
        "opponent"
      );

    if (
      opponent.id ===
      interaction.user.id
    ) {

      return interaction.reply({

        content:
          "❌ You cannot schedule yourself.",

        ephemeral: true
      });
    }

    const modal =
      new ModalBuilder()

        .setCustomId(
          `schedule_modal|${opponent.id}`
        )

        .setTitle(
          "Schedule Match"
        );

    // TIME
    const timeInput =
      new TextInputBuilder()

        .setCustomId(
          "schedule_time"
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
          "schedule_days"
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

    // GMT
    const timezoneInput =
      new TextInputBuilder()

        .setCustomId(
          "schedule_timezone"
        )

        .setLabel(
          "GMT Offset"
        )

        .setPlaceholder(
          "+5:30"
        )

        .setStyle(
          TextInputStyle.Short
        )

        .setRequired(true);

    // NOTES
    const notesInput =
      new TextInputBuilder()

        .setCustomId(
          "schedule_notes"
        )

        .setLabel(
          "Notes"
        )

        .setPlaceholder(
          "bo3 oras"
        )

        .setStyle(
          TextInputStyle.Paragraph
        )

        .setRequired(false);

    modal.addComponents(

      new ActionRowBuilder()
        .addComponents(timeInput),

      new ActionRowBuilder()
        .addComponents(daysInput),

      new ActionRowBuilder()
        .addComponents(timezoneInput),

      new ActionRowBuilder()
        .addComponents(notesInput)

    );

    await interaction.showModal(
      modal
    );
  }
};
