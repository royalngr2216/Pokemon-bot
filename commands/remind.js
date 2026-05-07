const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

const {
  parseTime,
  formatTime
} = require("../utils/timeParser");

const { getRandomColor } =
  require("../utils/colors");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("remind")
    .setDescription("Set a tournament reminder")
    .addStringOption(option =>
      option
        .setName("time")
        .setDescription(
          "Example: 1d 2h 30m"
        )
        .setRequired(true)
    ),

  async execute(interaction) {

    const input =
      interaction.options.getString("time");

    const duration = parseTime(input);

    if (!duration) {
      return interaction.reply({
        content:
          "❌ Invalid format.\nExamples:\n`1d`\n`2h 30m`\n`5h 28min`\n`1 day 2 hours`",
        ephemeral: true
      });
    }

    const max =
      30 * 24 * 60 * 60 * 1000;

    if (duration > max) {
      return interaction.reply({
        content:
          "❌ Maximum reminder is 30 days.",
        ephemeral: true
      });
    }

    await interaction.reply({
      content:
        `⏰ Reminder set for **${formatTime(duration)}**.`,
      ephemeral: true
    });

    setTimeout(async () => {
      try {

        const embed = new EmbedBuilder()
          .setTitle("🏆 Tournament Reminder")
          .setDescription(
            "Don't forget to play your tournament games on time!"
          )
          .setColor(getRandomColor())
          .setFooter({
            text:
              "Good luck & have fun ⚔️"
          })
          .setTimestamp();

        await interaction.user.send({
          embeds: [embed]
        });

      } catch (err) {
        console.log(
          `Could not DM ${interaction.user.tag}`
        );
      }
    }, duration);
  }
};
