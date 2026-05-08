let frozenUsers = [];

const freeze = async (client, msg, args) => {
    const monNumero = '237650554606@s.whatsapp.net';
    if (msg.sender !== monNumero) return msg.reply("⚠️ Seul *Prince K* peut geler un sujet.");

    const target = msg.mentionedJid[0] || (msg.quoted ? msg.quoted.sender : null);
    if (!target) return msg.reply("❌ Identifiez la cible.");

    frozenUsers.push(target);
    msg.reply(`❄️ @${target.split('@')[0]} a été gelé par *Prince K*.`, { mentions: [target] });
};
module.exports = freeze;
