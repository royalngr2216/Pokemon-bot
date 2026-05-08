const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

module.exports = {

  data: new SlashCommandBuilder()

    .setName("help")

    .setDescription(
      "View bot commands"
    ),

  async execute(interaction) {

    const embed =
      new EmbedBuilder()

        .setTitle(
          "ORAS UTILITIES"
        )

        .setColor(
          0x5865F2
        )

        .setDescription(

`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━ ⚔ COMPETITIVE ━━━━━━━━

Command : /pokemon
Action  : View Pokémon sets and resources

━━━━━━━━ 🌍 UTILITIES ━━━━━━━━━

Command : /tz
Action  : Create localized tournament times

Command : /remind
Action  : Tournament reminders

━━━━━━━━ 🏆 TOURNAMENT ━━━━━━━━

Command : /schedule
Action  : Schedule tournament matches

Command : /matches
Action  : View scheduled matches

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`

        );

    await interaction.reply({
      embeds: [embed]
    });
  }
};
