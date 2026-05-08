const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

module.exports = {

  data: new SlashCommandBuilder()

    .setName("purge")

    .setDescription(
      "Delete messages"
    )

    .addIntegerOption(option =>

      option

        .setName("amount")

        .setDescription(
          "Number of messages to delete"
        )

        .setRequired(true)

        .setMinValue(1)

        .setMaxValue(100)
    )

    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageMessages
    ),

  async execute(interaction) {

    const amount =
      interaction.options.getInteger(
        "amount"
      );

    // =========================
    // PERMISSION CHECK
    // =========================

    if (

      !interaction.member.permissions.has(
        PermissionFlagsBits.ManageMessages
      )

    ) {

      return interaction.reply({

        content:
          "❌ You do not have permission to use this command.",

        ephemeral: true
      });
    }

    try {

      await interaction.channel.bulkDelete(
        amount,
        true
      );

      const embed =
        new EmbedBuilder()

          .setColor(
            0x1E1F22
          )

          .setDescription(

            `🗑 Deleted **${amount}** messages.`

          );

      return interaction.reply({

        embeds: [embed],

        ephemeral: true
      });

    } catch {

      return interaction.reply({

        content:
          "❌ Failed to delete messages.",

        ephemeral: true
      });
    }
  }
};