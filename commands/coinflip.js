const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

module.exports = {

  data: new SlashCommandBuilder()

    .setName("cf")

    .setDescription(
      "Coinflip between two users"
    )

    .addUserOption(option =>

      option

        .setName("user1")

        .setDescription(
          "First user"
        )

        .setRequired(true)
    )

    .addUserOption(option =>

      option

        .setName("user2")

        .setDescription(
          "Second user"
        )

        .setRequired(true)
    ),

  async execute(interaction) {

    const user1 =
      interaction.options.getUser(
        "user1"
      );

    const user2 =
      interaction.options.getUser(
        "user2"
      );

    if (user1.id === user2.id) {

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
          `${user1.username} vs ${user2.username}`
        )

        .setDescription(

          `## 🎲 Coinflip\n\n` +

          `||🏆 ${winner.username} has won!||`
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
