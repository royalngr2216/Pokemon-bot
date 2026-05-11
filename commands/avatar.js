const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

module.exports = {

  data: new SlashCommandBuilder()

    .setName("avatar")

    .setDescription(
      "View a user's avatar"
    )

    .addUserOption(option =>

      option

        .setName("user")

        .setDescription(
          "Select a user"
        )

        .setRequired(false)
    ),

  async execute(interaction) {

    const user =
      interaction.options.getUser("user") ||
      interaction.user;

    const member =
      interaction.guild.members.cache.get(user.id);

    const serverAvatar =
      member?.avatarURL({
        size: 1024
      });

    const avatar =
      serverAvatar ||
      user.displayAvatarURL({
        size: 1024
      });

    const embed =
      new EmbedBuilder()

        .setAuthor({

          name: user.username,

          iconURL:
            user.displayAvatarURL()
        })

        .setTitle(
          serverAvatar
            ? "Server Avatar"
            : "User Avatar"
        )

        .setColor(0x5865F2)

        .setImage(avatar);

    await interaction.reply({
      embeds: [embed]
    });
  }
};
