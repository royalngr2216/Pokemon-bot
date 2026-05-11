const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

const User =
  require("../models/User");

module.exports = {

  data: new SlashCommandBuilder()

    .setName("register")

    .setDescription(
      "Register your Smogon username"
    )

    .addStringOption(option =>

      option

        .setName("username")

        .setDescription(
          "Your Smogon username"
        )

        .setRequired(true)
    ),

  async execute(interaction) {

    await interaction.deferReply({
      ephemeral: true
    });

    const username =
      interaction.options
        .getString("username")
        .trim();

    let user =
      await User.findOne({

        discordId:
          interaction.user.id
      });

    // =========================
    // UPDATE EXISTING
    // =========================

    if (user) {

      user.smogonName =
        username;

      await user.save();

    } else {

      // =========================
      // CREATE NEW
      // =========================

      user =
        await User.create({

          discordId:
            interaction.user.id,

          smogonName:
            username
        });
    }

    const embed =
      new EmbedBuilder()

        .setTitle(
          "✅ Smogon Account Linked"
        )

        .setColor(
          0x57F287
        )

        .setDescription(

          `**Discord:** ${interaction.user}\n\n` +

          `**Smogon Username:** ${username}`

        )

        .setFooter({

          text:
            "You can now use /tourlink"
        })

        .setTimestamp();

    await interaction.editReply({
      embeds: [embed]
    });
  }
};
