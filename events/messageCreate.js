module.exports = client => {

  client.on(
    "messageCreate",
    async message => {

      if (
        message.author.bot
      ) return;

      const matches =
        message.content.match(
          /:([a-zA-Z0-9_]+):/g
        );

      if (!matches) return;

      let content =
        message.content;

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

      if (
        content ===
        message.content
      ) return;

      try {

        await message.delete();

      } catch {}

      await message.channel.send({
        content
      });
    }
  );
};