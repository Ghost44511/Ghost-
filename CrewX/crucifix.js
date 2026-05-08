const crucifix = async (client, msg) => {
    if (!msg.isGroup) return;
    const target = msg.mentionedJid[0] || (msg.quoted ? msg.quoted.sender : null);
    
    if (!target) return msg.reply("☦️ Qui doit subir le jugement de *Prince K* ?");

    await client.groupParticipantsUpdate(msg.from, [target], "remove");
    msg.reply(`☦️ @${target.split('@')[0]} a été banni définitivement.`, { mentions: [target] });
};
module.exports = crucifix;
