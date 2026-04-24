require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const mongoose = require('mongoose');
const Tournament = require('../models/Tournament');
const { notifyUpdate } = require('./utils/api');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("DB Connected"))
  .catch(err => console.error("DB Error:", err));

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {

  if (interaction.isChatInputCommand()) {

    if (interaction.commandName === "tournament") {
      await Tournament.create({
        name: "Test Tournament",
        maxTeamSize: 5,
        teams: [],
        matches: [
          {
            team1: { name: "Team A" },
            team2: { name: "Team B" },
            winner: null
          }
        ],
        status: "ongoing"
      });

      return interaction.reply("Tournament created!");
    }
  }

  if (interaction.isButton()) {
    const t = await Tournament.findOne();

    if (!t || !t.matches?.length) {
      return interaction.reply("No tournament or match found.");
    }

    t.matches[0].winner = "Team A";
    await t.save();

    await notifyUpdate(t.name);

    return interaction.reply("Match updated!");
  }

});

client.login(process.env.TOKEN);