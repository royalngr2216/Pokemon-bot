// =========================
// SLASH COMMANDS
// =========================

if (
  interaction.isChatInputCommand()
) {

  // =========================
  // OWNER ID
  // =========================

  const OWNER_ID =
    "1287545546231255092";

  // =========================
  // BLOCK DMS
  // =========================

  if (
    !interaction.guild &&
    interaction.user.id !== OWNER_ID
  ) {

    return interaction.reply({

      content:
        "❌ You cannot use this command in DMs.",

      ephemeral: true
    });
  }

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
