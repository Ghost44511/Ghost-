const react = async (client, msg, args) => {
    if (!msg.quoted) return msg.reply("📌 Répondez à un message pour y faire réagir le bot.");
    const emoji = args[0] || '🤴';
    
    await client.sendMessage(msg.from, {
        react: { text: emoji, key: msg.quoted.key }
    });
};
module.exports = react;
