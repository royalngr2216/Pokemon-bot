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

        .setColor(0x1E1F22)

        .setTitle(
          "🌌 ORAS UTILITIES"
        )

        .setDescription(

`\`\`\`ansi
[2;34m━━━━━━━━━━ ⚔ COMPETITIVE ━━━━━━━━━━[0m
\`\`\`

\`\`\`ansi
[2;37mCommand :[0m [2;32m/pokemon[0m
[2;37mAction  :[0m [2;32mView Pokémon sets and resources[0m

[2;37mCommand :[0m [2;32m/dt[0m
[2;37mAction  :[0m [2;32mDetailed Pokémon / move / item info[0m
\`\`\`

\`\`\`ansi
[2;34m━━━━━━━━━━ 🌍 UTILITIES ━━━━━━━━━━━[0m
\`\`\`

\`\`\`ansi
[2;37mCommand :[0m [2;32m/tz[0m
[2;37mAction  :[0m [2;32mCreate localized tournament times[0m

[2;37mCommand :[0m [2;32m/avatar[0m
[2;37mAction  :[0m [2;32mView avatars[0m
\`\`\`

\`\`\`ansi
[2;34m━━━━━━━━━━ 🏆 TOURNAMENT ━━━━━━━━━━[0m
\`\`\`

\`\`\`ansi
[2;37mCommand :[0m [2;32m/register[0m
[2;37mAction  :[0m [2;32mRegister your Smogon username[0m

[2;37mCommand :[0m [2;32m/tourlink[0m
[2;37mAction  :[0m [2;32mImport Smogon tournament threads[0m

[2;37mCommand :[0m [2;32m/tours[0m
[2;37mAction  :[0m [2;32mView all active tournament matches[0m

[2;37mCommand :[0m [2;32m/tourschedule[0m
[2;37mAction  :[0m [2;32mSchedule a tournament match[0m

[2;37mCommand :[0m [2;32m/tourcancel[0m
[2;37mAction  :[0m [2;32mRemove a tournament entry[0m
\`\`\``

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
