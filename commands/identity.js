const {
  SlashCommandBuilder
} = require("discord.js");

const identities = {};

module.exports = {

  identities,

  data: new SlashCommandBuilder()

    .setName("identity")

    .setDescription(
      "Set custom emoji identity"
    )

    .addStringOption(option =>

      option

        .setName("name")

        .setDescription(
          "Custom name"
        )

        .setRequired(true)
    ),

  async execute(interaction) {

    const name =
      interaction.options.getString(
        "name"
      );

    identities[
      interaction.user.id
    ] = name;

    await interaction.reply({

      content:
        `✅ Identity set to **${name}**`,

      ephemeral: true
    });
  }
};
