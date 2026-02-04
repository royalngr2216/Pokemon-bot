const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");
const fs = require("fs");

// OWNER
const OWNER_ID = "1287545546231255092";

// Pokemon list (keys only)
const pokemonData = JSON.parse(fs.readFileSync("./pokemon.json"));

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

function showdownGif(name) {
  return `https://play.pokemonshowdown.com/sprites/xyani/${name}.gif`;
}

function pokeIcon(name) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${name}.png`;
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
    }
  ]);
}

client.once("ready", async () => {
  console.log("Bot Online");
  await registerCommands();
});

client.on("interactionCreate", async interaction => {

  // RESTART
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

    if (!pokemonData[name])
      return interaction.reply({ content: "Pokemon not found.", ephemeral: true });

    const embed = new EmbedBuilder()
      .setTitle(name.toUpperCase())
      .setColor(0x2b2d31)
      .setThumbnail(pokeIcon(name))
      .setImage(showdownGif(name))
      .setFooter({ text: "Animated sprite via Pokémon Showdown" });

    await interaction.reply({ embeds: [embed] });
  }
});

client.login(process.env.TOKEN);
