const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");
const fs = require("fs");

const data = JSON.parse(fs.readFileSync("./pokemon.json"));

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once("ready", async () => {
  console.log("Bot Online!");

  await client.application.commands.create({
    name: "pokemon",
    description: "View Pokémon sets",
    options: [
      {
        name: "name",
        description: "Pokemon name",
        type: 3,
        required: true
      }
    ]
  });
});

client.on("interactionCreate", async interaction => {

  // SLASH COMMAND
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "pokemon") {
      const name = interaction.options.getString("name").toLowerCase();
      const mon = data[name];

      if (!mon) {
        return interaction.reply({ content: "Pokemon not found.", ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setTitle(`✨ ${name.toUpperCase()}`)
        .setColor(0x8e44ad)
        .setThumbnail(mon.icon)
        .setImage(mon.images[0])
        .setFooter({ text: `1 / ${mon.images.length}` });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`prev_${name}`)
          .setLabel("⬅️")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`next_${name}`)
          .setLabel("➡️")
          .setStyle(ButtonStyle.Secondary)
      );

      await interaction.reply({ embeds: [embed], components: [row] });
    }
  }

  // BUTTONS
  if (interaction.isButton()) {
    const [action, name] = interaction.customId.split("_");
    const mon = data[name];

    let page = parseInt(interaction.message.embeds[0].footer.text.split(" ")[0]) - 1;

    if (action === "next") page++;
    if (action === "prev") page--;

    if (page < 0) page = mon.images.length - 1;
    if (page >= mon.images.length) page = 0;

    const embed = EmbedBuilder.from(interaction.message.embeds[0])
      .setImage(mon.images[page])
      .setFooter({ text: `${page + 1} / ${mon.images.length}` });

    await interaction.update({ embeds: [embed] });
  }
});

client.login(process.env.TOKEN);
