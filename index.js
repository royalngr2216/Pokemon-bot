const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");
const fs = require("fs");

// YOUR DISCORD ID (owner)
const OWNER_ID = "1287545546231255092";

const data = JSON.parse(fs.readFileSync("./pokemon.json"));

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

async function registerCommands() {
  await client.application.commands.set([
    {
      name: "pokemon",
      description: "View Pokémon",
      options: [
        {
          name: "name",
          description: "Pokemon name",
          type: 3,
          required: true
        }
      ]
    },
    {
      name: "restart",
      description: "Restart bot (owner only)"
    }
  ]);
}

client.once("ready", async () => {
  console.log("Bot Online");
  await registerCommands();
});

client.on("interactionCreate", async interaction => {

  // OWNER RESTART
  if (interaction.isChatInputCommand() && interaction.commandName === "restart") {
    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({ content: "Not allowed.", ephemeral: true });
    }

    await interaction.reply("Restarting...");
    await client.application.commands.set([]);
    setTimeout(() => process.exit(0), 1500);
  }

  // /pokemon command
  if (interaction.isChatInputCommand() && interaction.commandName === "pokemon") {

    const name = interaction.options.getString("name").toLowerCase();
    const mon = data[name];

    if (!mon) {
      return interaction.reply({ content: "Pokemon not found.", ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle(`👻 ${name.toUpperCase()}`)
      .setColor(0x2b2d31) // elegant dark (matches Discord theme)
      .setThumbnail(mon.icon)
      .setImage(mon.images[0])
      .setFooter({ text: `Image 1 / ${mon.images.length}` });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`prev_${name}`)
        .setEmoji("⬅️")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(`next_${name}`)
        .setEmoji("➡️")
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  }

  // BUTTON HANDLER
  if (interaction.isButton()) {

    const [action, name] = interaction.customId.split("_");
    const mon = data[name];

    let page = parseInt(interaction.message.embeds[0].footer.text.split(" ")[1]) - 1;

    if (action === "next") page++;
    if (action === "prev") page--;

    if (page < 0) page = mon.images.length - 1;
    if (page >= mon.images.length) page = 0;

    const embed = EmbedBuilder.from(interaction.message.embeds[0])
      .setImage(mon.images[page])
      .setFooter({ text: `Image ${page + 1} / ${mon.images.length}` });

    await interaction.update({ embeds: [embed] });
  }
});

client.login(process.env.TOKEN);
