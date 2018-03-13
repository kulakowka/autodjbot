const express = require("express");
const TelegramBot = require("node-telegram-bot-api");

const token = process.env.TELEGRAM_BOT_TOKEN;

const bot = new TelegramBot(token, { polling: true });

const chats = new Map();
const listenLink = chatId => "http://localhost:3000/" + chatId;

bot.onText(/\/list/, (msg, match) => {
  const chatId = msg.chat.id;

  const urls = chats.get(`${chatId}`) || [];

  const resp = urls
    ? "urls:" + [...urls].map(url => `\n<a href="${url}">${url}</a>`)
    : "no urls";

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp, {
    parse_mode: "HTML",
    disable_web_page_preview: true
  });
});

bot.onText(
  /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/,
  (msg, match) => {
    const chatId = msg.chat.id;
    const url = match[0];

    if (!chats.has(`${chatId}`)) {
      chats.set(`${chatId}`, new Set());
    }

    const urls = chats.get(`${chatId}`);

    urls.add(url);

    console.log(url, msg);

    console.log(chats);
    const linkUrl = listenLink(chatId);

    bot.sendMessage(
      chatId,
      `Listen radio at <a href="${linkUrl}">${linkUrl}</a>`,
      {
        parse_mode: "HTML",
        disable_web_page_preview: true
      }
    );
  }
);

const app = express();

app.get("/:chatId.json", (req, res) => {
  const { chatId } = req.params;

  const urls = chats.get(`${chatId}`);

  console.log("urls", urls);

  res.json([...urls]);
});

app.get("/:chatId", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.listen(3000);
