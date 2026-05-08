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

        .setColor(0x111214)

        .setTitle(
          "ORAS PANEL"
        )

        .setDescription(

`\`\`\`ansi
[2;37m━━━━━━━━━━ ⚔ COMPETITIVE ━━━━━━━━━━[0m
\`\`\`

\`\`\`ansi
[2;37mCommand :[0m [2;37m/pokemon[0m
[2;37mAction  :[0m [2;32mPokémon sets and resources[0m
\`\`\`

\`\`\`ansi
[2;37m━━━━━━━━━━ 🌍 UTILITIES ━━━━━━━━━━━[0m
\`\`\`

\`\`\`ansi
[2;37mCommand :[0m [2;37m/tz[0m
[2;37mAction  :[0m [2;32mLocalized tournament times[0m

[2;37mCommand :[0m [2;37m/remind[0m
[2;37mAction  :[0m [2;32mTournament reminders[0m
\`\`\`

\`\`\`ansi
[2;37m━━━━━━━━━━ 🏆 TOURNAMENT ━━━━━━━━━━[0m
\`\`\`

\`\`\`ansi
[2;37mCommand :[0m [2;37m/schedule[0m
[2;37mAction  :[0m [2;32mSchedule tournament matches[0m

[2;37mCommand :[0m [2;37m/matches[0m
[2;37mAction  :[0m [2;32mView scheduled matches[0m
\`\`\``

        );

    await interaction.reply({
      embeds: [embed]
    });
  }
};
