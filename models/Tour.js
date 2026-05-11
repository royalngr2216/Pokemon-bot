const mongoose =
  require("mongoose");

const tourSchema =
  new mongoose.Schema({

    discordId: String,

    tournament: String,

    set: String,

    round: String,

    opponent: String,

    deadline: String,

    thread: String,

    scheduled: {

      type: Boolean,

      default: false
    },

    scheduleTime: {

      type: String,

      default: null
    },

    timezone: {

      type: String,

      default: null
    },

    scheduledFor: {

      type: Number,

      default: null
    },

    reminded: {

      type: Boolean,

      default: false
    }
  });

module.exports =
  mongoose.model(
    "Tour",
    tourSchema
  );
