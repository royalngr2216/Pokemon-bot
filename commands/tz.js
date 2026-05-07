const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require("discord.js");

const timezones =
  require("../utils/timezones");

module.exports = {

  data: new SlashCommandBuilder()
    .setName("tz")
    .setDescription(
      "Create a localized match time"
    ),

  async execute(interaction) {

    const menu =
      new StringSelectMenuBuilder()

        .setCustomId(
          "tz_timezone_select"
        )

        .setPlaceholder(
          "Select your timezone"
        )

        .addOptions(timezones);

    const row =
      new ActionRowBuilder()
        .addComponents(menu);

    await interaction.reply({

      content:
        "Select your timezone:",

      components: [row],

      ephemeral: true
    });
  }
};
