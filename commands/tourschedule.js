const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder
} = require("discord.js");

const Tour =
  require("../models/Tour");

module.exports = {

  data: new SlashCommandBuilder()

    .setName("tourschedule")

    .setDescription(
      "Schedule a tournament match"
    )

    .addStringOption(option =>

      option

        .setName("opponent")

        .setDescription(
          "Opponent username"
        )

        .setRequired(true)
    ),

  async execute(interaction) {

    const opponent =
      interaction.options
        .getString("opponent");

    // =========================
    // FIND EXISTING TOUR
    // =========================

    let tour =
      await Tour.findOne({

        discordId:
          interaction.user.id,

        opponent: {

          $regex:
            new RegExp(
              `^${opponent}$`,
              "i"
            )
        }
      });

    // =========================
    // CREATE MANUAL TOUR
    // =========================

    if (!tour) {

      tour =
        await Tour.create({

          discordId:
            interaction.user.id,

          opponent,

          tournament:
            "Custom Match",

          deadline:
            "No deadline",

          scheduled:
            false
        });
    }

    // =========================
    // CREATE MODAL
    // =========================

    const modal =
      new ModalBuilder()

        .setCustomId(
          `schedule_${tour._id}`
        )

        .setTitle(
          `Schedule vs ${tour.opponent}`
        );

    // =========================
    // DAYS INPUT
    // =========================

    const daysInput =
      new TextInputBuilder()

        .setCustomId(
          "days"
        )

        .setLabel(
          "Days Until Match"
        )

        .setPlaceholder(
          "2"
        )

        .setStyle(
          TextInputStyle.Short
        )

        .setRequired(true);

    // =========================
    // TIME INPUT
    // =========================

    const timeInput =
      new TextInputBuilder()

        .setCustomId(
          "time"
        )

        .setLabel(
          "Time (24h format)"
        )

        .setPlaceholder(
          "22:30"
        )

        .setStyle(
          TextInputStyle.Short
        )

        .setRequired(true);

    // =========================
    // GMT INPUT
    // =========================

    const timezoneInput =
      new TextInputBuilder()

        .setCustomId(
          "timezone"
        )

        .setLabel(
          "GMT Offset"
        )

        .setPlaceholder(
          "+5:30"
        )

        .setStyle(
          TextInputStyle.Short
        )

        .setRequired(true);

    // =========================
    // ADD INPUTS
    // =========================

    modal.addComponents(

      new ActionRowBuilder()
        .addComponents(
          daysInput
        ),

      new ActionRowBuilder()
        .addComponents(
          timeInput
        ),

      new ActionRowBuilder()
        .addComponents(
          timezoneInput
        )
    );

    // =========================
    // SHOW MODAL
    // =========================

    await interaction.showModal(
      modal
    );
  }
};
