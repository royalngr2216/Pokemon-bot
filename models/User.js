const mongoose =
  require("mongoose");

const userSchema =
  new mongoose.Schema({

    discordId: String,

    smogonName: String
  });

module.exports =
  mongoose.model(
    "User",
    userSchema
  );
