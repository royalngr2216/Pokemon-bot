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
// GET WEBHOOK
// =========================

const webhooks =
  await message.channel.fetchWebhooks();

let webhook =
  webhooks.find(
    wh =>
      wh.owner.id === client.user.id
  );

if (!webhook) {

  webhook =
    await message.channel.createWebhook({

      name: "OrasBot"
    });
}

// =========================
// SEND AS FAKE USER
// =========================

await webhook.send({

  content,

  username: fakeName,

  avatarURL:
    message.author.displayAvatarURL(),

  allowedMentions: {
    repliedUser: false
  }
});
    }
  );
};
