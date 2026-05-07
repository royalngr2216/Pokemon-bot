const mongoose =
  require("mongoose");

const matchSchema =
  new mongoose.Schema({

    matchId: {
      type: String,
      required: true
    },

    guildId: {
      type: String,
      required: true
    },

    player1: {
      type: String,
      required: true
    },

    player2: {
      type: String,
      required: true
    },

    timestamp: {
      type: Number,
      required: true
    },

    notes: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      default: "pending"
    }

  });

module.exports =
  mongoose.model(
    "Match",
    matchSchema
  );
