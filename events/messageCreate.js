module.exports = client => {

  client.on(
    "messageCreate",
    async message => {

      // =========================
      // IGNORE BOTS
      // =========================

      if (
        message.author.bot
      ) return;

      // =========================
      // FIND :emoji:
      // =========================

      const matches =
        message.content.match(
          /:([a-zA-Z0-9_]+):/g
        );

      if (!matches) return;

      let content =
        message.content;

      // =========================
      // REPLACE EMOJIS
      // =========================

      for (const match of matches) {

        const name =
          match.slice(1, -1);

        const emoji =
          client.emojis.cache.find(

            e =>
              e.name.toLowerCase() ===
              name.toLowerCase()
          );

        if (emoji) {

          const formatted =

            emoji.animated

              ? `<a:${emoji.name}:${emoji.id}>`

              : `<:${emoji.name}:${emoji.id}>`;

          content =
            content.replace(
              match,
              formatted
            );
        }
      }

      // =========================
      // NO CHANGES
      // =========================

      if (
        content ===
        message.content
      ) return;

      // =========================
      // DELETE ORIGINAL
      // =========================

      try {

        await message.delete();

      } catch {}

      // =========================
      // CUSTOM IDENTITY
      // =========================

      const identityCommand =
        client.commands.get(
          "identity"
        );

      const identities =
        identityCommand?.identities || {};

      const fakeName =
        identities[
          message.author.id
        ] || message.author.username;

      // =========================
      // SEND MESSAGE
      // =========================

      await message.channel.send({

        content:
          `**${fakeName}**\n${content}`
      });
    }
  );
};
