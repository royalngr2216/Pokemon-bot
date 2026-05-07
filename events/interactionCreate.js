const {
  EmbedBuilder
} = require("discord.js");

module.exports = client => {

  client.on("interactionCreate",
    async interaction => {

      // AUTOCOMPLETE
      if (interaction.isAutocomplete()) {

        const command =
          client.commands.get(
            interaction.commandName
          );

        if (!command?.autocomplete)
          return;

        return command.autocomplete(
          interaction
        );
      }

      // SLASH COMMANDS
      if (interaction.isChatInputCommand()) {

        const command =
          client.commands.get(
            interaction.commandName
          );

        if (!command) return;

        try {
          await command.execute(
            interaction
          );
        } catch (err) {
          console.error(err);

          if (
            interaction.replied ||
            interaction.deferred
          ) {
            interaction.editReply({
              content:
                "❌ Command error."
            });
          } else {
            interaction.reply({
              content:
                "❌ Command error.",
              ephemeral: true
            });
          }
        }
      }

      // BUTTONS
      if (interaction.isButton()) {

        const pokemonCommand =
          client.commands.get("pokemon");

        const pokemon =
          pokemonCommand.pokemon;

        const [action, name] =
          interaction.customId.split("_");

        const mon = pokemon[name];

        if (!mon) return;

        const images = mon.sets;

        let page =
          parseInt(
            interaction.message.embeds[0]
              .footer.text.split(" ")[1]
          ) - 1;

        if (action === "next") page++;
        if (action === "prev") page--;
        if (action === "first") page = 0;
        if (action === "last")
          page = images.length - 1;

        if (page < 0)
          page = images.length - 1;

        if (page >= images.length)
          page = 0;

        const oldEmbed =
          interaction.message.embeds[0];

        const embed =
          EmbedBuilder.from(oldEmbed)
            .setImage(images[page])
            .setFooter({
              text:
                `Set ${page + 1} of ${images.length}`,
              iconURL:
                interaction.user.displayAvatarURL()
            });

        await interaction.update({
          embeds: [embed]
        });
      }
    });
};
