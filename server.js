import { Telegraf } from "telegraf";
import userModel from "./src/models/user.js"
import connectdb from "./src/config/db.js";
import eventModel from "./src/models/Events.js"
import fetch from "node-fetch"; // Import node-fetch library
const bot = new Telegraf("8184087570:AAGkkmppo56pqNkIqRNwHvs8E_9yDPkZJbY");

try {
  connectdb();
  console.log("MongoDB connected");
} catch (err) {
  console.error(err);
  process.kill(process.pid, "SIGTERM");
}

bot.start(async (ctx) => {
  const from = ctx.update.message.from;
  console.log("from:", from);
  try {
    await userModel.findOneAndUpdate(
      { tgId: from.id },
      {
        $setOnInsert: {
          firstName: from.first_name,
          lastName: from.last_name,
          isBot: from.is_bot,
          username: from.username,
        },
      },
      { upsert: true, new: true }
    );
    await ctx.reply(
      `Hukkum Mere Akaa, ${from.first_name} , M App ki Wish Puri Krne K Liye Yha Hu.`
    );
  } catch (err) {
    console.error(err);
    ctx.reply("Kuch Dikkat ho rhi h.");
  }
});

bot.command("generate", async (ctx) => {
  const from = ctx.update.message.from;

  try {
    const lastEvent = await eventModel.findOne({ tgId: from.id }).sort({ createdAt: -1 }).limit(1);

    if (!lastEvent) {
      ctx.reply("Btayiye Apne Wish Tabhi to Puri Krunga");
      return;
    }

    console.log("Last event:", lastEvent);

    const response = await fetch("https://open-ai21.p.rapidapi.com/conversationgpt35", {
      method: "POST",
      headers: {
        // Your api keys here
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: `${lastEvent.text}+give the answer of this question in minimum lines`, // Use the text from the last event
          },
        ],
        web_access: false,
        system_prompt: "",
        temperature: 0.9,
        top_k: 5,
        top_p: 0.9,
        max_tokens: 256,
      }),
    });

    const body = await response.json();
    console.log("API response:", body.result);

    ctx.reply("Abhi Pesh Krta Hu...");
    ctx.reply(body.result);
    ctx.reply("Ye Lijiye Mere Akka Or Koi Wish"); 
  } catch (err) {
    console.error("Generate command error:", err);
    ctx.reply("Kuch Dikkat ho rhi h.");
  }
});

bot.on("text", async (ctx) => {
  const from = ctx.message.from;
  const message = ctx.message.text;

  try {
    await eventModel.create({
      text: message,
      tgId: from.id,
    });
    await ctx.reply("Accha Mere Akka Jb App ki Wish Puri Ho Jaye To Is Pr Click Kr De..  /generate");
  } catch (err) {
    console.error("Text event error:", err);
    await ctx.reply("Bhai ruk ja kuch gadbad horhi h");
  }
});

bot.launch().then(() => {
  console.log("Bot started");
}).catch((err) => {
  console.error("Bot launch error:", err);
});

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
