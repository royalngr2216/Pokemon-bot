const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");
const fs = require("fs");

const OWNER_ID = "1287545546231255092";

const pokemon = JSON.parse(fs.readFileSync("./pokemon.json"));

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

function showdownGif(name) {
  return `https://play.pokemonshowdown.com/sprites/xyani/${name}.gif`;
}

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
    },
    {
      name: "ping",
      description: "Check bot status"
    }
  ]);
}

client.once("ready", async () => {
  console.log("Bot Online");
  await registerCommands();
});

client.on("interactionCreate", async interaction => {

  // /ping
  if (interaction.isChatInputCommand() && interaction.commandName === "ping") {
    const latency = Date.now() - interaction.createdTimestamp;
    return interaction.reply(`${latency} Backshots!\nBot is Online!`);
  }

  // /restart (owner only)
  if (interaction.isChatInputCommand() && interaction.commandName === "restart") {
    if (interaction.user.id !== OWNER_ID)
      return interaction.reply({ content: "Not allowed.", ephemeral: true });

    await interaction.reply("Restarting...");
    await client.application.commands.set([]);
    setTimeout(() => process.exit(0), 1500);
  }

  // /pokemon
  if (interaction.isChatInputCommand() && interaction.commandName === "pokemon") {

    const name = interaction.options.getString("name").toLowerCase();
    const mon = pokemon[name];

    if (!mon)
      return interaction.reply({ content: "Pokemon not found.", ephemeral: true });

    const images = mon.sets || [];

    if (images.length === 0)
      return interaction.reply({ content: "No sets added yet for this Pokémon.", ephemeral: true });

    const embed = new EmbedBuilder()
      .setTitle(name.toUpperCase())
      .setColor(0x2b2d31)
      .setThumbnail(showdownGif(name)) // animated gif thumbnail
      .setImage(images[0])
      .setFooter({ text: `1 / ${images.length}` });

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

  // buttons
  if (interaction.isButton()) {
    const [action, name] = interaction.customId.split("_");
    const mon = pokemon[name];
    const images = mon.sets || [];

    let page = parseInt(interaction.message.embeds[0].footer.text.split(" ")[0]) - 1;

    if (action === "next") page++;
    if (action === "prev") page--;

    if (page < 0) page = images.length - 1;
    if (page >= images.length) page = 0;

    const embed = EmbedBuilder.from(interaction.message.embeds[0])
      .setImage(images[page])
      .setFooter({ text: `${page + 1} / ${images.length}` });

    await interaction.update({ embeds: [embed] });
  }
});

client.login(process.env.TOKEN);
