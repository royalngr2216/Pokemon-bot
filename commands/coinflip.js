const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

module.exports = {

  data: new SlashCommandBuilder()

    .setName("cf")

    .setDescription(
      "Coinflip between two players"
    )

    .addStringOption(option =>

      option

        .setName("user1")

        .setDescription(
          "First player"
        )

        .setRequired(true)
    )

    .addStringOption(option =>

      option

        .setName("user2")

        .setDescription(
          "Second player"
        )

        .setRequired(true)
    ),

  async execute(interaction) {

    const user1 =
      interaction.options.getString(
        "user1"
      );

    const user2 =
      interaction.options.getString(
        "user2"
      );

    if (
      user1.toLowerCase() ===
      user2.toLowerCase()
    ) {

      return interaction.reply({

        content:
          "❌ Cannot coinflip the same user.",

        ephemeral: true
      });
    }

    const winner =
      Math.random() < 0.5
        ? user1
        : user2;

    const embed =
      new EmbedBuilder()

        .setTitle(
          `${user1} vs ${user2}`
        )

        .setDescription(

          `# 🎲 Coinflip\n\n` +

          `||🏆 ${winner} has won!||`
        )

        .setColor(0xFEE75C)

        .setImage(
          "https://media.tenor.com/rJX0sQ1k7TIAAAAd/misaka-mikoto-misaka-mikoto-railgun.gif"
        )

        .setFooter({

          text:
            `Requested by ${interaction.user.username}`,

          iconURL:
            interaction.user.displayAvatarURL()
        })

        .setTimestamp();

    await interaction.reply({
      embeds: [embed]
    });
  }
};
