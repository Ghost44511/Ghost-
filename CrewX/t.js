const translate = require('@vitalets/google-translate-api');

const t = async (client, msg, args) => {
    const text = args.join(" ");
    if (!text) return msg.reply("✍️ Donnez un texte à traduire.");

    const res = await translate(text, { to: 'en' });
    msg.reply(`🌍 *TRADUCTION PRINCE K*\n\n🇫🇷/🇨🇲 : ${text}\n🇺🇸/🇬🇧 : ${res.text}`);
};
module.exports = t;
