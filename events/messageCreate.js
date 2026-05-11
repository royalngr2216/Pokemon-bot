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

          content =
            content.replace(
              match,
              `<:${emoji.name}:${emoji.id}>`
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
      // RESEND
      // =========================

      await message.channel.send({

        content,

        allowedMentions: {
          repliedUser: false
        }
      });
    }
  );
};
