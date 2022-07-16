/*
  DON'T MESS WITH THIS UNLESS YOU KNOW WHAT YOU'RE DOING
*/

// Data

const express = require("express");
const discord = require("discord.js");
const bodyparser = require("body-parser");
const util = require("util");
const fs = require("fs");
const enmap = require("enmap");
const request = require("request");
const config = require("./config.js"); // Bot Config
const moment = require("moment");
const noblox = require("noblox.js");
require("moment-duration-format");

// File System
const promisify = util.promisify;
const readdir = promisify(fs.readdir);
const readfile = promisify(fs.readFile);
const writefile = promisify(fs.writeFile);

// Classes and Objects
const app = express();

let res = "https://discord.com/api/webhooks/ID123/TOKEN123/";
if (process.env.WEBHOOK_LINK) {
  res = process.env.WEBHOOK_LINK.match(
    /discord.com\/api\/webhooks\/([^\/]+)\/([^\/]+)/
  );
}

let WEBHOOK_ID = res[1];
let WEBHOOK_TOKEN = res[2];
const client = new discord.WebhookClient(WEBHOOK_ID, WEBHOOK_TOKEN);

// Expand
client.config = config;

// App
app.use(bodyparser.json());
app.set("env", "production");
app.use(bodyparser.urlencoded({ extended: true }));

// Set the auto-pinger
app.get("/", function (err, res) {
  res.sendStatus(200);
});

app.post("/ping", function (err, res) {
  res.sendStatus(200);
  client.send("Ping test");
  // vibe check
});

app.post("/rankUser", function (req, res) {
  let body = req.body;
  console.log(body);
  if (!body) {
    return res.sendStatus(400);
  }
  if (!body.key) {
    return res.sendStatus(403);
  }
  if (body.key != process.env.ODERA_KEY) {
    return res.sendStatus(403);
  }
  noblox
    .setRank(
      body.rankInfo.groupId,
      body.rankInfo.targetId,
      body.rankInfo.rankNumber
    )
    .then(async (role) => {
      let user = await noblox.getPlayerInfo(body.rankInfo.targetId);
      client.send(
        "User " +
          user.username +
          " was successfully ranked to " +
          role.name +
          "."
      );
      res.sendStatus(200);
    })
    .catch((err) => {
      client.send("An error occurred within noblox while ranking.\n" + err);
      res.sendStatus(500);
    });
});

const listener = app.listen(process.env.PORT, function () {
  console.log("Bot is listening on port " + listener.address().port);
});

if (process.env.COOKIE) {
  noblox
    .setCookie(process.env.COOKIE)
    .then(function () {
      console.log("Logged in!");
    })
    .catch(function (err) {
      console.log("Unable to log in!", err);
    });
}
